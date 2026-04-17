import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Button,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import Context from '../Context/Context';
import {
  CtxDataType,
  FilterCatalog,
  ProjectLevelDataType,
  ProjectSynopsisContext,
  RankedProject,
  SummaryMetrics,
} from '../Types';
import {
  DEFAULT_DASHBOARD_FILTERS,
  getAppliedFilterEntries,
} from '../utils/dashboardFilters';
import { fetchProjectSynopsis, parseQueryWithFallback } from '../utils/assistant';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

interface Props {
  filterCatalog: FilterCatalog;
  filteredProjects: ProjectLevelDataType[];
  rankedProjects: RankedProject[];
  projectSynopsisContext: ProjectSynopsisContext;
  summaryMetrics: SummaryMetrics;
  summaryText: string;
}

const buildContextSignature = (filters: any, projectSynopsisContext: ProjectSynopsisContext) => JSON.stringify({
  filters,
  totalProjects: projectSynopsisContext.totalProjects,
  topProjectIds: projectSynopsisContext.topProjects.map((project) => project.id),
});

const buildFilterSignature = (filters: any) => JSON.stringify(filters);

export const QueryAssistantPanel = (props: Props) => {
  const {
    filterCatalog,
    filteredProjects,
    rankedProjects,
    projectSynopsisContext,
    summaryMetrics,
    summaryText,
  } = props;
  const {
    filters,
    applyDashboardFilters,
    updateDashboardFilter,
    resetDashboardFilters,
  } = useContext(Context) as CtxDataType;
  const { i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [synopsisText, setSynopsisText] = useState('');
  const [synopsisError, setSynopsisError] = useState('');
  const [synopsisStale, setSynopsisStale] = useState(false);
  const [unresolvedTerms, setUnresolvedTerms] = useState<string[]>([]);
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingSignature, setPendingSignature] = useState('');
  const [lastResolvedSignature, setLastResolvedSignature] = useState('');
  const synopsisRequestIdRef = useRef(0);

  const currentSignature = buildContextSignature(filters, projectSynopsisContext);
  const currentFilterSignature = buildFilterSignature(filters);
  const appliedFilters = getAppliedFilterEntries(filters, filterCatalog);
  const topProjects = rankedProjects.slice(0, 5);

  useEffect(() => {
    if (lastResolvedSignature && lastResolvedSignature !== currentSignature && synopsisText) {
      setSynopsisStale(true);
    }
  }, [currentSignature, lastResolvedSignature, synopsisText]);

  useEffect(() => {
    if (!pendingQuery || pendingSignature !== currentFilterSignature) return undefined;

    if (!filteredProjects.length) {
      setSynopsisText('');
      setSynopsisError('');
      setSynopsisLoading(false);
      setSynopsisStale(false);
      setLastResolvedSignature(currentSignature);
      setPendingQuery('');
      setPendingSignature('');
      return undefined;
    }

    const requestId = synopsisRequestIdRef.current + 1;
    synopsisRequestIdRef.current = requestId;

    const runSynopsis = async () => {
      setSynopsisLoading(true);
      setSynopsisError('');

      try {
        const response = await fetchProjectSynopsis({
          query: pendingQuery,
          locale: i18n.language,
          filters,
          summaryMetrics,
          projectContext: projectSynopsisContext,
        });

        if (synopsisRequestIdRef.current !== requestId) return;
        setSynopsisText(response.synopsis || '');
        setSynopsisStale(false);
        setLastResolvedSignature(currentSignature);
      } catch (error: any) {
        if (synopsisRequestIdRef.current !== requestId) return;
        setSynopsisText('');
        setSynopsisError(error?.message || 'Unable to load project overview.');
      } finally {
        if (synopsisRequestIdRef.current === requestId) {
          setSynopsisLoading(false);
          setPendingQuery('');
          setPendingSignature('');
        }
      }
    };

    runSynopsis();

    return () => {
      if (synopsisRequestIdRef.current === requestId) {
        setSynopsisLoading(false);
      }
    };
  }, [
    currentSignature,
    currentFilterSignature,
    filteredProjects.length,
    i18n.language,
    pendingQuery,
    pendingSignature,
  ]);

  const submitQuery = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setParseLoading(true);
    setSynopsisText('');
    setSynopsisError('');
    setSynopsisStale(false);

    try {
      const parsed = await parseQueryWithFallback(trimmedQuery, i18n.language, filterCatalog);
      const nextFilters = {
        ...DEFAULT_DASHBOARD_FILTERS,
        ...parsed.filters,
      };

      if (nextFilters.category === 'all') {
        nextFilters.subCategory = 'all';
      }

      applyDashboardFilters(nextFilters);
      setLastSubmittedQuery(trimmedQuery);
      setUnresolvedTerms(parsed.unresolvedTerms);
      setPendingQuery(trimmedQuery);
      setPendingSignature(buildFilterSignature(nextFilters));
    } catch (error: any) {
      setSynopsisError(error?.message || 'Unable to parse query.');
    } finally {
      setParseLoading(false);
    }
  };

  const refreshSynopsis = () => {
    const effectiveQuery = lastSubmittedQuery || query.trim();
    if (!effectiveQuery) return;

    setPendingQuery(effectiveQuery);
    setPendingSignature(currentFilterSignature);
    setSynopsisError('');
  };

  return (
    <div
      className='margin-bottom-05'
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: '0.75rem',
        padding: '1rem',
        background: '#fafafa',
      }}
    >
      <Title level={4} style={{ marginBottom: '0.75rem' }}>
        Ask the dashboard
      </Title>
      <Paragraph style={{ marginBottom: '0.75rem' }}>
        Enter a natural-language query and the assistant will translate it into dashboard filters.
        The summary below is deterministic and always reflects the current filter state.
      </Paragraph>
      <TextArea
        rows={3}
        placeholder='Example: Show non-VF clean cooking work in LDCs'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Space style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        <Button type='primary' loading={parseLoading} onClick={submitQuery}>
          Apply query
        </Button>
        <Button onClick={() => {
          setQuery('');
          setLastSubmittedQuery('');
          setSynopsisText('');
          setSynopsisError('');
          setSynopsisStale(false);
          setUnresolvedTerms([]);
          resetDashboardFilters();
        }}
        >
          Clear filters
        </Button>
        <Button
          disabled={!lastSubmittedQuery || synopsisLoading || !filteredProjects.length}
          onClick={refreshSynopsis}
        >
          Refresh project overview
        </Button>
      </Space>

      {lastSubmittedQuery ? (
        <div
          style={{
            borderRadius: '0.5rem',
            background: '#fff',
            padding: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <Text strong>Latest query:</Text>
          <Paragraph style={{ marginBottom: 0 }}>{lastSubmittedQuery}</Paragraph>
        </div>
      ) : null}

      <div className='margin-bottom-04'>
        <Text strong>Applied filters</Text>
        <div style={{ marginTop: '0.5rem' }}>
          {appliedFilters.length ? appliedFilters.map((entry) => (
            <Tag
              key={`${entry.key}-${entry.value}`}
              closable
              onClose={(event) => {
                event.preventDefault();
                updateDashboardFilter(entry.key, 'all');
              }}
              style={{ marginBottom: '0.5rem' }}
            >
              {entry.label}
            </Tag>
          )) : <Text type='secondary'>No filters applied.</Text>}
        </div>
      </div>

      {unresolvedTerms.length ? (
        <Alert
          type='info'
          showIcon
          message={`Ignored unsupported terms: ${unresolvedTerms.join(', ')}`}
          style={{ marginBottom: '0.75rem' }}
        />
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '0.5rem',
            padding: '0.75rem',
          }}
        >
          <Text strong>Deterministic summary</Text>
          <Paragraph style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            {summaryText}
          </Paragraph>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '0.5rem',
            padding: '0.75rem',
          }}
        >
          <Text strong>Project overview</Text>
          <Paragraph style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            {synopsisLoading
              ? 'Generating project overview...'
              : synopsisText || 'Project overview will appear here after a query is applied and the proxy endpoint is available.'}
          </Paragraph>
          {synopsisStale ? (
            <Alert
              type='warning'
              showIcon
              message='Filters changed after the last project overview. Refresh to regenerate it for the current slice.'
            />
          ) : null}
          {synopsisError ? (
            <Alert
              type='error'
              showIcon
              message={synopsisError}
              style={{ marginTop: '0.5rem' }}
            />
          ) : null}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '0.5rem',
            padding: '0.75rem',
          }}
        >
          <Text strong>Top projects</Text>
          <div style={{ marginTop: '0.5rem' }}>
            {topProjects.length ? topProjects.map((project, index) => (
              <Paragraph key={project.id} style={{ marginBottom: '0.5rem' }}>
                <Text strong>
                  {`${index + 1}.`}
                </Text>
                {' '}
                {project.title}
                {' '}
                <Text type='secondary'>
                  (
                  {project.countryName}
                  )
                </Text>
              </Paragraph>
            )) : <Text type='secondary'>No projects match the current filters.</Text>}
          </div>
        </div>
      </div>
    </div>
  );
};
