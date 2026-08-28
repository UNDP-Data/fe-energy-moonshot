import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Input,
  Tag,
} from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CornerDownLeft } from 'lucide-react';
import Context from '../Context/Context';
import {
  CtxDataType,
  FilterCatalog,
  DashboardFilters,
  ProjectLevelDataType,
  ProjectSynopsisContext,
  SummaryMetrics,
} from '../Types';
import {
  getAppliedFilterEntries,
  DEFAULT_DASHBOARD_FILTERS,
} from '../utils/dashboardFilters';
import { fetchProjectSynopsis, parseQueryWithFallback } from '../utils/assistant';

const { TextArea } = Input;

const Panel = styled.div`
  margin-bottom: 1rem;
`;

const QueryGrid = styled.div`
  display: block;
  margin-bottom: 0.75rem;
`;

const PromptRow = styled.div`
  width: 100%;
`;

const PromptInput = styled(TextArea)`
  &.ant-input {
    background:
      linear-gradient(135deg, rgba(144, 255, 255, 0.22), rgba(255, 255, 255, 0.96) 42%),
      var(--white);
    border: 1px solid var(--black);
    border-radius: 0.75rem;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
    font-size: 1rem;
    line-height: 1.45;
    min-height: 3.5rem;
    padding: 1rem 3.5rem 0.7rem 1rem;
    resize: vertical;
    width: 100%;
  }
  &.ant-input::placeholder {
    color: var(--gray-600);
  }
  &.ant-input:hover,
  &.ant-input:focus {
    border-color: var(--moonshot-dashboard-accent, #1f6fff);
    box-shadow: 0 0 0 3px var(--moonshot-dashboard-accent-soft, rgba(31, 111, 255, 0.12));
  }
`;

const PromptInputWrap = styled.div<{ $hasFilters?: boolean }>`
  position: relative;
  width: 100%;
  ${(props) => (props.$hasFilters ? `
    ${PromptInput}.ant-input {
      padding-right: min(25rem, 48vw);
    }
    @media (max-width: 760px) {
      ${PromptInput}.ant-input {
        padding-right: 3.5rem;
        padding-top: 3.1rem;
      }
    }
    @media (max-width: 520px) {
      ${PromptInput}.ant-input {
        padding-right: 3.5rem;
        padding-top: 1rem;
      }
    }
  ` : '')}
`;

const PromptLabel = styled.label`
  background: var(--white);
  color: var(--gray-700);
  font-size: 0.875rem;
  font-weight: 400;
  left: 0.85rem;
  line-height: 1;
  padding: 0 0.35rem;
  position: absolute;
  top: -0.42rem;
  z-index: 3;
`;

const InlineSubmitButton = styled(Button)`
  &.ant-btn {
    align-items: center;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid var(--moonshot-dashboard-accent-border, rgba(31, 111, 255, 0.32));
    border-radius: 0.65rem;
    box-shadow: 0 0.18rem 0.55rem var(--moonshot-dashboard-accent-soft, rgba(31, 111, 255, 0.12));
    color: var(--moonshot-dashboard-accent, #1f6fff);
    display: inline-flex;
    height: 2.25rem;
    justify-content: center;
    position: absolute;
    right: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    transition: box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
    width: 2.25rem;
    z-index: 2;
  }
  &.ant-btn:hover,
  &.ant-btn:focus {
    background: rgba(240, 247, 255, 0.96);
    border-color: var(--moonshot-dashboard-accent, #1f6fff);
    color: var(--moonshot-dashboard-accent, #0058e6);
    box-shadow: 0 0.28rem 0.75rem var(--moonshot-dashboard-accent-soft, rgba(31, 111, 255, 0.18));
    transform: translateY(-50%) scale(1.04);
  }
  &.ant-btn:active {
    transform: translateY(-50%) scale(0.98);
  }
  &.ant-btn .ant-btn-icon {
    display: inline-flex;
  }
`;

const AppliedFilterList = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-end;
  max-width: min(28rem, calc(100% - 5rem));
  position: absolute;
  right: 3.4rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  .ant-tag {
    align-items: center;
    background: rgba(255, 255, 255, 0.76);
    border-color: var(--moonshot-dashboard-accent-border, rgba(31, 111, 255, 0.22));
    border-radius: 999px;
    color: var(--gray-700);
    display: inline-flex;
    font-size: 0.7rem;
    gap: 0.25rem;
    line-height: 1;
    margin-inline-end: 0;
    max-width: 12rem;
    min-height: 1.45rem;
    padding: 0.18rem 0.38rem 0.18rem 0.55rem;
    white-space: nowrap;
  }
  .ant-tag .ant-tag-close-icon {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.7rem;
    margin-inline-start: 0.1rem;
  }
  .ant-tag span:not(.ant-tag-close-icon) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 760px) {
    justify-content: flex-start;
    left: 1rem;
    max-width: calc(100% - 4.5rem);
    right: 3.4rem;
    top: 1.05rem;
    transform: none;
  }
  @media (max-width: 520px) {
    margin-top: 0.35rem;
    max-width: 100%;
    position: static;
    transform: none;
  }
`;

export interface AssistantProjectOverviewState {
  loading: boolean;
  text: string;
  error: string;
  stale: boolean;
}

interface Props {
  filterCatalog: FilterCatalog;
  filteredProjects: ProjectLevelDataType[];
  projectSynopsisContext: ProjectSynopsisContext;
  summaryMetrics: SummaryMetrics;
  onProjectOverviewChange: (_state: AssistantProjectOverviewState) => void;
}

const buildContextSignature = (
  filters: any,
  projectSynopsisContext: ProjectSynopsisContext,
  locale: string,
) => JSON.stringify({
  locale,
  filters,
  totalProjects: projectSynopsisContext.totalProjects,
  topProjectIds: projectSynopsisContext.topProjects.map((project) => project.id),
});

const buildFilterSignature = (filters: any) => JSON.stringify(filters);

export const QueryAssistantPanel = (props: Props) => {
  const {
    filterCatalog,
    filteredProjects,
    projectSynopsisContext,
    summaryMetrics,
    onProjectOverviewChange,
  } = props;
  const {
    filters,
    applyDashboardFilters,
    updateDashboardFilter,
  } = useContext(Context) as CtxDataType;
  const { i18n, t } = useTranslation();
  const defaultQueryText = t('default-ai-query-text');
  const defaultOverviewQuery = t('default-project-overview-query');
  const [query, setQuery] = useState(defaultQueryText);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [synopsisText, setSynopsisText] = useState('');
  const [synopsisError, setSynopsisError] = useState('');
  const [synopsisStale, setSynopsisStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingSignature, setPendingSignature] = useState('');
  const [pendingFilters, setPendingFilters] = useState<DashboardFilters | null>(null);
  const [lastResolvedSignature, setLastResolvedSignature] = useState('');
  const synopsisRequestIdRef = useRef(0);
  const inFlightSignatureRef = useRef('');
  const lastRequestedSignatureRef = useRef('');

  const currentSignature = useMemo(
    () => buildContextSignature(filters, projectSynopsisContext, i18n.language),
    [filters, i18n.language, projectSynopsisContext],
  );
  const currentFilterSignature = useMemo(
    () => buildFilterSignature(filters),
    [filters],
  );
  const appliedFilters = useMemo(
    () => getAppliedFilterEntries(filters, filterCatalog),
    [filterCatalog, filters],
  );
  const projectOverviewLoadErrorText = t('project-overview-load-error');
  const queryParseErrorText = t('query-parse-error');
  const previousDefaultQueryRef = useRef(defaultQueryText);
  const queryEditedRef = useRef(false);

  useEffect(() => {
    if (!queryEditedRef.current || query === previousDefaultQueryRef.current) {
      setQuery(defaultQueryText);
      queryEditedRef.current = false;
    }
    previousDefaultQueryRef.current = defaultQueryText;
  }, [defaultQueryText, query]);

  useEffect(() => {
    onProjectOverviewChange({
      loading: synopsisLoading,
      text: synopsisText,
      error: synopsisError,
      stale: synopsisStale,
    });
  }, [
    onProjectOverviewChange,
    synopsisError,
    synopsisLoading,
    synopsisStale,
    synopsisText,
  ]);

  const runSynopsis = useCallback(async (
    requestId: number,
    effectiveQuery: string,
    effectiveFilters: DashboardFilters,
    resolutionSignature: string,
  ) => {
    inFlightSignatureRef.current = resolutionSignature;
    lastRequestedSignatureRef.current = resolutionSignature;
    setSynopsisLoading(true);
    setSynopsisError('');

    try {
      const response = await fetchProjectSynopsis({
        query: effectiveQuery,
        locale: i18n.language,
        filters: effectiveFilters,
        summaryMetrics,
        projectContext: projectSynopsisContext,
      });

      if (synopsisRequestIdRef.current !== requestId) return;
      setSynopsisText(response.synopsis || '');
      setSynopsisStale(false);
      setLastResolvedSignature(resolutionSignature);
    } catch (error: any) {
      if (synopsisRequestIdRef.current !== requestId) return;
      setSynopsisText('');
      setSynopsisError(error?.message || projectOverviewLoadErrorText);
      setLastResolvedSignature(resolutionSignature);
    } finally {
      if (synopsisRequestIdRef.current === requestId) {
        inFlightSignatureRef.current = '';
        setSynopsisLoading(false);
        setPendingQuery('');
        setPendingSignature('');
        setPendingFilters(null);
      }
    }
  }, [
    i18n.language,
    projectOverviewLoadErrorText,
    projectSynopsisContext,
    summaryMetrics,
  ]);

  useEffect(() => {
    if (
      pendingQuery
      || synopsisLoading
      || lastResolvedSignature === currentSignature
      || inFlightSignatureRef.current === currentSignature
      || lastRequestedSignatureRef.current === currentSignature
    ) return undefined;

    if (!filteredProjects.length) {
      setSynopsisText('');
      setSynopsisError(t('project-overview-no-projects'));
      setSynopsisLoading(false);
      setSynopsisStale(false);
      setLastResolvedSignature(currentSignature);
      inFlightSignatureRef.current = '';
      lastRequestedSignatureRef.current = currentSignature;
      return undefined;
    }

    const requestId = synopsisRequestIdRef.current + 1;
    synopsisRequestIdRef.current = requestId;
    runSynopsis(requestId, lastSubmittedQuery || defaultOverviewQuery, filters, currentSignature);

    return undefined;
  }, [
    currentSignature,
    defaultOverviewQuery,
    filteredProjects.length,
    filters,
    lastResolvedSignature,
    lastSubmittedQuery,
    pendingQuery,
    runSynopsis,
    synopsisLoading,
    t,
  ]);

  useEffect(() => {
    if (!pendingQuery || !pendingFilters) return undefined;

    if (pendingSignature !== currentFilterSignature) {
      return undefined;
    }

    if (!filteredProjects.length) {
      setSynopsisText('');
      setSynopsisError(t('project-overview-no-projects'));
      setSynopsisLoading(false);
      setSynopsisStale(false);
      setLastResolvedSignature(currentSignature);
      inFlightSignatureRef.current = '';
      lastRequestedSignatureRef.current = currentSignature;
      setPendingQuery('');
      setPendingSignature('');
      setPendingFilters(null);
      return undefined;
    }

    const requestId = synopsisRequestIdRef.current + 1;
    synopsisRequestIdRef.current = requestId;
    runSynopsis(requestId, pendingQuery, pendingFilters, currentSignature);

    return undefined;
  }, [
    currentSignature,
    currentFilterSignature,
    filteredProjects.length,
    pendingFilters,
    pendingQuery,
    pendingSignature,
    runSynopsis,
    t,
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

      setLastSubmittedQuery(trimmedQuery);
      setPendingQuery(trimmedQuery);
      setPendingSignature(buildFilterSignature(nextFilters));
      setPendingFilters(nextFilters);
      setSynopsisLoading(true);
      startTransition(() => {
        applyDashboardFilters(nextFilters);
      });
    } catch (error: any) {
      setSynopsisError(error?.message || queryParseErrorText);
    } finally {
      setParseLoading(false);
    }
  };

  return (
    <Panel data-walkthrough-target='ai-query-panel'>
      <QueryGrid>
        <PromptRow>
          <PromptInputWrap $hasFilters={appliedFilters.length > 0}>
            <PromptLabel className='moonshot-ai-prompt-label' htmlFor='moonshot-ai-query'>{t('ask-energy-moonshot-ai')}</PromptLabel>
            <PromptInput
              id='moonshot-ai-query'
              data-walkthrough-target='ai-query-input'
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder={t('ask-dashboard-placeholder')}
              value={query}
              onChange={(event) => {
                queryEditedRef.current = true;
                setQuery(event.target.value);
              }}
              onPressEnter={(event) => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  submitQuery();
                }
              }}
            />
            {appliedFilters.length ? (
              <AppliedFilterList aria-label={t('applied-filters')}>
                {appliedFilters.map((entry) => (
                  <Tag
                    key={`${entry.key}-${entry.value}`}
                    closable
                    title={entry.label}
                    onClose={(event) => {
                      event.preventDefault();
                      updateDashboardFilter(entry.key, 'all');
                    }}
                  >
                    {entry.label}
                  </Tag>
                ))}
              </AppliedFilterList>
            ) : null}
            <InlineSubmitButton
              aria-label={t('apply-query')}
              data-walkthrough-target='ai-query-submit'
              icon={<CornerDownLeft size={17} strokeWidth={2.25} />}
              loading={parseLoading}
              onClick={submitQuery}
              shape='circle'
              title={t('apply-query')}
              type='primary'
            />
          </PromptInputWrap>
        </PromptRow>
      </QueryGrid>

    </Panel>
  );
};
