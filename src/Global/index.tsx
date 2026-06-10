import {
  Profiler,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import { useTranslation } from 'react-i18next';
import { Alert, Typography } from 'antd';
import { Download } from 'lucide-react';
import styled from 'styled-components';
import {
  CountryGroupDataType,
  CountryMetadataRow,
  CtxDataType,
  DataType,
  FilterCatalog,
  IndicatorMetaDataType,
  IndicatorRange,
  ProjectLevelDataType,
} from '../Types';
import { LANGUAGE_OPTIONS, SupportedLanguage } from '../i18nConfig';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { BarFilters } from './BarFilters';
import { UnivariateMap } from './UnivariateMap';
import { DataTable } from './DataTable';
import {
  AssistantProjectOverviewState,
  QueryAssistantPanel,
} from './QueryAssistantPanel';
import { isAssistantAvailable } from '../utils/assistant';
import {
  buildCountryMetadataMap,
  filterProjects,
  getProjectDirectBeneficiariesForFilters,
  outputMatchesFilters,
  rankProjects,
} from '../utils/dashboardFilters';
import {
  buildProjectSynopsisContext,
  buildSummaryMetrics,
  formatSummaryNumber,
  generateDeterministicSummary,
} from '../utils/summary';
import { downloadMoonshotResultsWorkbook } from '../utils/exportWorkbook';

const { Link, Paragraph, Text } = Typography;

const getFilterSignature = (filters: CtxDataType['filters']) => JSON.stringify(filters);

const getActiveFilterPerfMark = () => {
  if (typeof window === 'undefined') return undefined;
  return (window as any).__moonshotFilterPerf;
};

const logFilterPerfStep = (label: string, startedAt: number, detail?: Record<string, unknown>) => {
  const mark = getActiveFilterPerfMark();
  if (!mark || mark.completed) return;
  const endedAt = window.performance.now();
  const duration = endedAt - startedAt;
  const elapsed = endedAt - mark.startedAt;
  const step = {
    label,
    durationMs: Number(duration.toFixed(1)),
    elapsedMs: Number(elapsed.toFixed(1)),
    detail: detail || {},
  };
  mark.steps = [...(mark.steps || []), step];
  // eslint-disable-next-line no-console
  console.log(`[Moonshot filter transition #${mark.id}] ${label}`, {
    duration: `${duration.toFixed(1)}ms`,
    elapsed: `${elapsed.toFixed(1)}ms`,
    ...(detail || {}),
  });
};

const measureFilterPerfStep = <T,>(
  label: string,
  callback: () => T,
  getDetail?: (_result: T) => Record<string, unknown>,
): T => {
  const startedAt = typeof window !== 'undefined' ? window.performance.now() : 0;
  const result = callback();
  if (typeof window !== 'undefined') {
    logFilterPerfStep(label, startedAt, getDetail ? getDetail(result) : undefined);
  }
  return result;
};

const logRenderPerf = (
  componentName: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  _baseDuration: number,
  startTime: number,
  commitTime: number,
) => {
  if (phase !== 'update') return;
  const mark = getActiveFilterPerfMark();
  if (!mark || mark.completed) return;
  const elapsed = commitTime - mark.startedAt;
  const step = {
    label: `render ${componentName}`,
    durationMs: Number(actualDuration.toFixed(1)),
    elapsedMs: Number(elapsed.toFixed(1)),
    detail: {
      commitAt: `${commitTime.toFixed(1)}ms`,
      renderStartedAt: `${startTime.toFixed(1)}ms`,
    },
  };
  mark.steps = [...(mark.steps || []), step];
  // eslint-disable-next-line no-console
  console.log(`[Moonshot filter transition #${mark.id}] render ${componentName}`, {
    duration: `${actualDuration.toFixed(1)}ms`,
    elapsed: `${elapsed.toFixed(1)}ms`,
    actualDuration: `${actualDuration.toFixed(1)}ms`,
    commitAt: `${commitTime.toFixed(1)}ms`,
  });
};

const KpiSummaryRow = styled.div`
  align-items: stretch;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 0.35rem;
  overflow: hidden;
  width: 100%;
  > * {
    min-width: 0;
  }
  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardTitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  width: 100%;
  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const DashboardActions = styled.div`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.7rem;
  margin-top: 0.1rem;
  @media (max-width: 720px) {
    align-self: flex-start;
  }
`;

const DashboardTitle = styled.h2`
  margin-bottom: 0 !important;
  @media (max-width: 640px) {
    letter-spacing: -0.035em;
    max-width: 100%;
  }
`;

const DashboardLanguageControl = styled.label`
  flex: 0 0 auto;
`;

const DashboardScope = styled.div`
  --moonshot-dashboard-text: var(--black);
  --moonshot-dashboard-muted: var(--gray-700);
  --moonshot-dashboard-surface: #fff;
  --moonshot-dashboard-surface-soft: var(--gray-200);
  --moonshot-dashboard-border: #d9d9d9;
  --moonshot-dashboard-input-bg: var(--white);
  --moonshot-dashboard-accent: #1f6fff;
  --moonshot-dashboard-accent-soft: rgba(31, 111, 255, 0.12);
  --moonshot-dashboard-accent-border: rgba(31, 111, 255, 0.28);
  --moonshot-dashboard-kpi-active: var(--yellow-bg, #FFE17E);
  color: var(--moonshot-dashboard-text);
`;

const KpiPanel = styled.div`
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const SummaryPanel = styled.div`
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const SummaryCard = styled.div`
  background: var(--moonshot-dashboard-surface);
  box-sizing: border-box;
  border: 1px solid var(--moonshot-dashboard-border);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 0.8rem;
  width: 100%;
`;

const SummaryTitle = styled.h3`
  color: var(--moonshot-dashboard-text);
  font-size: 0.75rem;
  line-height: 1.2;
  margin: 0 0 0.35rem;
`;

const SummaryBody = styled(Paragraph)`
  &.ant-typography {
    font-size: calc(0.7rem + 1pt);
    line-height: 1.4;
    margin-bottom: 0;
  }
  .ant-typography {
    font-size: inherit;
    line-height: inherit;
    vertical-align: baseline;
  }
`;

const FilterMapRow = styled.div`
  align-items: stretch;
  display: grid;
  gap: 0;
  grid-template-columns: minmax(18rem, 30%) minmax(0, 70%);
  width: 100%;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const FilterPanel = styled.div`
  align-self: stretch;
  display: flex;
  min-width: 0;
  width: 100%;
`;

const MapPanel = styled.div`
  align-self: stretch;
  display: flex;
  min-width: 0;
  width: 100%;
`;

const MapSurface = styled.div`
  background-color: var(--moonshot-dashboard-surface-soft);
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const ExploreProjectsSection = styled.section`
  margin-top: 1.5rem;
`;

const ExploreProjectsHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;
  @media (max-width: 640px) {
    align-items: center;
  }
`;

const ExploreProjectsHeading = styled.h3`
  color: var(--moonshot-dashboard-text);
  font-size: 1.625rem;
  line-height: 1.2;
  margin: 0;
`;

const WorkbookExportButton = styled.button`
  align-items: center;
  background: var(--moonshot-dashboard-surface);
  border: 1px solid var(--moonshot-dashboard-border);
  border-radius: 50%;
  color: var(--moonshot-dashboard-text);
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: 1.75rem;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: background-color 120ms ease, outline-color 120ms ease;
  width: 1.75rem;
  &:hover,
  &:focus-visible {
    background: var(--moonshot-dashboard-input-bg);
    outline: 2px solid var(--moonshot-dashboard-accent);
    outline-offset: 2px;
  }
`;

const TopProjectItem = styled.div`
  margin-bottom: 0.75rem;
`;

const TopProjectMeta = styled.div`
  color: var(--moonshot-dashboard-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.9rem;
  margin-top: 0.25rem;
  padding-left: 1.35rem;
`;

const ProjectOverviewBody = styled(Paragraph)`
  &.ant-typography {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .ant-typography {
    font-size: inherit;
    line-height: inherit;
    vertical-align: baseline;
  }
`;

const ProjectOverviewTitle = styled(Text)`
  &.ant-typography {
    font-size: calc(1rem + 2pt);
  }
`;

const ProjectCardsGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 0.5rem;
  @media (max-width: 640px) {
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }
`;

const ProjectSectionCard = styled.div`
  background: var(--moonshot-dashboard-surface);
  border: 1px solid var(--moonshot-dashboard-border);
  border-radius: 0.75rem;
  box-sizing: border-box;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 1rem;
  @media (max-width: 640px) {
    border-radius: 0.6rem;
    padding: 0.8rem;
  }
`;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderSummaryWithBoldNumbers = (text: string, strongPhrases: string[] = []) => {
  const unitLabel = [
    'active energy-related projects?',
    'direct beneficiaries',
    'beneficiaries',
    'projects?',
    'countries',
    'people',
    'outputs?',
  ].join('|');
  const numberWithUnit = String.raw`\$?\b\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s+(?:million|billion|thousand))?(?:\s+(?:USD|${unitLabel}))`;
  const formattedLargeNumber = String.raw`\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b`;
  const numberPattern = new RegExp(`(${numberWithUnit}|${formattedLargeNumber})`, 'gi');
  const numberTokenPattern = new RegExp(`^(?:${numberWithUnit}|${formattedLargeNumber})$`, 'i');
  const uniquePhrases = Array.from(new Set(strongPhrases
    .map((phrase) => phrase.trim())
    .filter((phrase) => phrase.length > 2)))
    .sort((a, b) => b.length - a.length);
  const phrasePattern = uniquePhrases.length
    ? new RegExp(`(${uniquePhrases.map(escapeRegExp).join('|')})`, 'gi')
    : undefined;
  const segments = text
    .split(numberPattern)
    .flatMap((segment) => (phrasePattern ? segment.split(phrasePattern) : [segment]));

  return segments.map((segment, index) => (
    numberTokenPattern.test(segment)
      || uniquePhrases.some((phrase) => phrase.toLowerCase() === segment.toLowerCase())
      ? (
        <Text strong key={`${segment}-${index}`}>
          {segment}
        </Text>
      )
      : segment
  ));
};

interface Props {
  countryGroupData: CountryGroupDataType[];
  countryMetadata: CountryMetadataRow[];
  filterCatalog: FilterCatalog;
  indicators: IndicatorMetaDataType[];
  geojsonMapData: any[];
  countryLinkDict: any;
  projectLevelData: ProjectLevelDataType[];
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const buildCountryFallback = (
  countryCode: string,
  project: ProjectLevelDataType,
  metadata: CountryMetadataRow | undefined,
) => ({
  'Alpha-2 code': '',
  'Alpha-3 code': countryCode,
  'Country or Area': metadata?.['Country Name'] || project.countryName || project.country || countryCode,
  'Development classification': '',
  'Group 1': '',
  'Group 2': '',
  'Group 3': '',
  LDC: `${metadata?.LDC || ''}`.trim() !== '',
  LLDC: `${metadata?.LLDC || ''}`.trim() !== '',
  'Latitude (average)': 0,
  'Longitude (average)': 0,
  'Numeric code': 0,
  SIDS: `${metadata?.SIDS || ''}`.trim() !== '',
  'Income group': metadata?.Economy || project.incomeGroup || '',
  bbox: {
    sw: { lat: 0, lon: 0 },
    ne: { lat: 0, lon: 0 },
  },
});

export const Global = (props: Props) => {
  const {
    countryGroupData,
    countryMetadata,
    filterCatalog,
    indicators,
    geojsonMapData,
    projectLevelData,
    countryLinkDict,
    language,
    onLanguageChange,
  } = props;
  const { filters } = useContext(Context) as CtxDataType;
  const { t } = useTranslation();
  const filterSignature = useMemo(() => getFilterSignature(filters), [filters]);
  const lastCompletedFilterSignatureRef = useRef('');
  const [assistantAvailable, setAssistantAvailable] = useState(false);
  const [projectOverviewState, setProjectOverviewState] = useState<AssistantProjectOverviewState>({
    loading: false,
    text: '',
    error: '',
    stale: false,
  });

  useEffect(() => {
    let active = true;

    const checkAssistant = async () => {
      const available = await isAssistantAvailable();
      if (active) {
        setAssistantAvailable(available);
      }
    };

    checkAssistant();

    return () => {
      active = false;
    };
  }, []);

  const countryMetadataByCode = useMemo(
    () => measureFilterPerfStep(
      'buildCountryMetadataMap',
      () => buildCountryMetadataMap(countryMetadata),
      (result) => ({ countryMetadataRows: Object.keys(result).length }),
    ),
    [countryMetadata],
  );

  const filteredProjectData = useMemo(
    () => measureFilterPerfStep(
      'filterProjects',
      () => filterProjects(projectLevelData, filters, countryMetadataByCode),
      (result) => ({
        inputProjects: projectLevelData.length,
        outputProjects: result.length,
      }),
    ),
    [countryMetadataByCode, filters, projectLevelData],
  );
  const deferredTableProjects = useDeferredValue(filteredProjectData);

  const availableCountryList = useMemo(
    () => measureFilterPerfStep(
      'availableCountryList',
      () => Array.from(new Set(filteredProjectData.map((project) => project.countryCode))),
      (result) => ({ countries: result.length }),
    ),
    [filteredProjectData],
  );

  const rankedProjects = useMemo(
    () => measureFilterPerfStep(
      'rankProjects',
      () => rankProjects(filteredProjectData, filters),
      (result) => ({ rankedProjects: result.length }),
    ),
    [filteredProjectData, filters],
  );

  const summaryMetrics = useMemo(
    () => measureFilterPerfStep(
      'buildSummaryMetrics',
      () => buildSummaryMetrics(filteredProjectData, filters, countryMetadataByCode),
      (result) => ({
        projectCount: result.projectCount,
        countryCount: result.countryCount,
      }),
    ),
    [countryMetadataByCode, filteredProjectData, filters],
  );

  const summaryText = useMemo(
    () => measureFilterPerfStep(
      'generateDeterministicSummary',
      () => generateDeterministicSummary(summaryMetrics, filters, countryMetadataByCode, t),
      (result) => ({ summaryCharacters: result.length }),
    ),
    [countryMetadataByCode, filters, summaryMetrics, t],
  );

  const projectSynopsisContext = useMemo(
    () => measureFilterPerfStep(
      'buildProjectSynopsisContext',
      () => buildProjectSynopsisContext(filteredProjectData, filters),
      (result) => ({
        totalProjects: result.totalProjects,
        topProjects: result.topProjects.length,
      }),
    ),
    [filteredProjectData, filters],
  );
  const topProjects = useMemo(
    () => measureFilterPerfStep(
      'topProjects slice',
      () => rankedProjects.slice(0, 5),
      (result) => ({ topProjects: result.length }),
    ),
    [rankedProjects],
  );
  const projectOverviewStrongPhrases = useMemo(
    () => projectSynopsisContext.topProjects.flatMap((project) => [
      project.title,
      project.countryName,
    ]),
    [projectSynopsisContext],
  );

  const mapData = useMemo(() => {
    return measureFilterPerfStep('build mapData', () => {
      const groupedData = nest()
        .key((project: any) => project.countryCode)
        .entries(filteredProjectData);

      return groupedData.map((country: any) => {
        const firstProject = country.values[0] as ProjectLevelDataType;
        const metadata = countryMetadataByCode[country.key];
        const countryGroup = countryGroupData.find((row) => row['Alpha-3 code'] === country.key)
          || buildCountryFallback(country.key, firstProject, metadata);
        const region = firstProject.region || metadata?.Region || '';
        const numberOfProjects = country.values.length;

        const indicatorValues = indicators.map((indicator) => {
          const indicatorName = indicator.DataKey;

          if (indicator.AggregationLevel === 'outputs') {
            return {
              indicator: indicatorName,
              value: sumBy(country.values, (project: ProjectLevelDataType) => (
              sumBy(project.outputs || [], (output: any) => (
                outputMatchesFilters(output, filters) ? Number(output[indicatorName] || 0) : 0
              ))
              )),
            };
          }

          return {
            indicator: indicatorName,
            value: indicatorName === 'directBeneficiaries'
              ? sumBy(country.values, (project: ProjectLevelDataType) => (
                getProjectDirectBeneficiariesForFilters(project, filters)
              ))
              : sumBy(country.values, (project: ProjectLevelDataType) => Number(project[indicatorName as keyof ProjectLevelDataType] || 0)),
          };
        });

        const projectCountIndex = indicatorValues.findIndex((indicator) => indicator.indicator === 'nProj');
        if (projectCountIndex !== -1) {
          indicatorValues[projectCountIndex].value = numberOfProjects;
        }

        return {
          ...countryGroup,
          region,
          indicatorsAvailable: indicatorValues.map((indicator) => indicator.indicator),
          indicators: indicatorValues,
          numberProjects: numberOfProjects,
        } as DataType;
      });
    }, (result) => ({ mapCountries: result.length }));
  }, [
    countryGroupData,
    countryMetadataByCode,
    filteredProjectData,
    filters,
    indicators,
  ]);

  const countryList = useMemo(() => measureFilterPerfStep(
    'countryList',
    () => projectLevelData.reduce((accum: string[], projectData) => {
      if (!accum.includes(projectData.countryCode)) {
        accum.push(projectData.countryCode);
      }
      return accum;
    }, []),
    (result) => ({ countries: result.length }),
  ), [projectLevelData]);

  const binningRangeLarge = useMemo(() => {
    return measureFilterPerfStep('build binningRangeLarge', () => {
      const ranges: IndicatorRange = mapData.reduce((accum: IndicatorRange, country) => {
        country.indicatorsAvailable.forEach((indicatorName: string) => {
          const value = country.indicators.find((indicator) => indicator.indicator === indicatorName);
          if (value && typeof value.value === 'number') {
            accum[indicatorName].push(value.value);
          }
        });
        return accum;
      }, indicators.reduce((accum, indicator: IndicatorMetaDataType) => ({
        ...accum,
        [indicator.DataKey]: [],
      }), {} as IndicatorRange));

      indicators.forEach((indicator: IndicatorMetaDataType) => {
        ranges[indicator.DataKey].sort((left: number, right: number) => left - right);
        const q = Math.ceil((ranges[indicator.DataKey].length - 1) / 9);
        let i = 1;
        const legendArray = [];

        if (!ranges[indicator.DataKey].length || q <= 0) {
          ranges[indicator.DataKey] = [0];
          return;
        }

        do {
          const currentValue = ranges[indicator.DataKey][i * q];
          const numstr = Math.ceil(currentValue || 0).toString();
          const num = parseInt(numstr[0] + '0'.repeat(Math.max(numstr.length - 1, 0)), 10);
          legendArray.push(num);
          i += 1;
        } while (i * q < ranges[indicator.DataKey].length - 1);

        ranges[indicator.DataKey] = Array.from(new Set(legendArray.length ? legendArray : [0]));
      });

      return ranges;
    }, (result) => ({ indicatorRanges: Object.keys(result).length }));
  }, [indicators, mapData]);

  useEffect(() => {
    const mark = getActiveFilterPerfMark();
    if (!mark || mark.completed || lastCompletedFilterSignatureRef.current === filterSignature) return undefined;
    lastCompletedFilterSignatureRef.current = filterSignature;
    const frameId = window.requestAnimationFrame(() => {
      const elapsed = window.performance.now() - mark.startedAt;
      mark.steps = [
        ...(mark.steps || []),
        {
          label: 'first rendered frame',
          durationMs: Number(elapsed.toFixed(1)),
          elapsedMs: Number(elapsed.toFixed(1)),
          detail: {
            filteredProjects: filteredProjectData.length,
            mapCountries: mapData.length,
          },
        },
      ];
      // eslint-disable-next-line no-console
      console.log(`[Moonshot filter transition #${mark.id}] first rendered frame`, {
        elapsed: `${elapsed.toFixed(1)}ms`,
        filteredProjects: filteredProjectData.length,
        mapCountries: mapData.length,
      });
      // eslint-disable-next-line no-console
      console.table((mark.steps || []).map((step: any) => ({
        step: step.label,
        durationMs: step.durationMs,
        elapsedMs: step.elapsedMs,
        detail: JSON.stringify(step.detail || {}),
      })));
      // eslint-disable-next-line no-console
      console.log(`[Moonshot filter transition #${mark.id}] total`, `${elapsed.toFixed(1)}ms`);
      mark.completed = true;
      // eslint-disable-next-line no-console
      console.groupEnd();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [filterSignature, filteredProjectData.length, mapData.length]);

  return (
    <DashboardScope className='moonshot-dashboard'>
      <div id='tracker' className='flex-div flex-wrap padding-top-06'>
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <DashboardTitleRow>
            <DashboardTitle className='undp-typography page-title'>
              <span style={{ color: 'var(--dark-yellow)' }}>
                {t('page-title-energy-moonshot')}
              </span>
              {' '}
              {t('page-title-tracker')}
            </DashboardTitle>
            <DashboardActions>
              <DashboardLanguageControl
                className='undp-language-control'
                htmlFor='dashboard-language-select'
              >
                <select
                  id='dashboard-language-select'
                  className='undp-language-select'
                  value={language}
                  onChange={(event) => {
                    onLanguageChange(event.target.value as SupportedLanguage);
                  }}
                  aria-label={t('language')}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </DashboardLanguageControl>
            </DashboardActions>
          </DashboardTitleRow>
          {assistantAvailable ? (
            <Profiler id='QueryAssistantPanel' onRender={logRenderPerf}>
              <QueryAssistantPanel
                filterCatalog={filterCatalog}
                filteredProjects={filteredProjectData}
                projectSynopsisContext={projectSynopsisContext}
                summaryMetrics={summaryMetrics}
                onProjectOverviewChange={setProjectOverviewState}
              />
            </Profiler>
          ) : null}
          <Profiler id='Settings' onRender={logRenderPerf}>
            <Settings />
          </Profiler>
          <KpiSummaryRow>
            <KpiPanel>
              <Profiler id='Cards' onRender={logRenderPerf}>
                <Cards data={mapData} />
              </Profiler>
            </KpiPanel>
            <SummaryPanel>
              <Profiler id='SummaryCard' onRender={logRenderPerf}>
                <SummaryCard>
                  <SummaryTitle className='undp-typography'>
                    {t('portfolio-overview')}
                  </SummaryTitle>
                  <SummaryBody>
                    {renderSummaryWithBoldNumbers(summaryText)}
                  </SummaryBody>
                </SummaryCard>
              </Profiler>
            </SummaryPanel>
          </KpiSummaryRow>
          <FilterMapRow>
            <FilterPanel>
              <Profiler id='BarFilters' onRender={logRenderPerf}>
                <BarFilters
                  data={filteredProjectData}
                  countryList={countryList}
                  countryMetadataByCode={countryMetadataByCode}
                  indicators={indicators}
                />
              </Profiler>
            </FilterPanel>
            <MapPanel>
              <MapSurface>
                <Profiler id='UnivariateMap' onRender={logRenderPerf}>
                  <UnivariateMap
                    availableCountryList={availableCountryList}
                    geojsonMapData={geojsonMapData}
                    data={mapData}
                    indicators={indicators}
                    binningRangeLarge={binningRangeLarge}
                  />
                </Profiler>
              </MapSurface>
            </MapPanel>
          </FilterMapRow>
        </div>
      </div>
      <hr className='undp-style light' />
      <ExploreProjectsSection>
        <ExploreProjectsHeader>
          <ExploreProjectsHeading className='undp-typography'>
            {t('explore-the-projects')}
          </ExploreProjectsHeading>
          <WorkbookExportButton
            type='button'
            onClick={() => downloadMoonshotResultsWorkbook({
              countryMetadataByCode,
              filterCatalog,
              filters,
              projects: filteredProjectData,
              summaryMetrics,
              summaryText,
            })}
            aria-label={t('download-projects-xlsx')}
            title={t('download-projects-xlsx')}
          >
            <Download aria-hidden='true' size={15} strokeWidth={2} />
          </WorkbookExportButton>
        </ExploreProjectsHeader>
        {assistantAvailable ? (
          <Profiler id='ProjectOverviewAndTopProjects' onRender={logRenderPerf}>
            <ProjectCardsGrid>
              <ProjectSectionCard>
                <ProjectOverviewTitle strong>{t('project-overview')}</ProjectOverviewTitle>
                <ProjectOverviewBody>
                  {projectOverviewState.loading
                    ? t('generating-project-overview')
                    : renderSummaryWithBoldNumbers(
                      projectOverviewState.text || t('project-overview-placeholder'),
                      projectOverviewStrongPhrases,
                    )}
                </ProjectOverviewBody>
                {projectOverviewState.stale ? (
                  <Alert
                    type='warning'
                    showIcon
                    message={t('project-overview-stale')}
                  />
                ) : null}
                {projectOverviewState.error ? (
                  <Alert
                    type='error'
                    showIcon
                    message={projectOverviewState.error}
                    style={{ marginTop: '0.5rem' }}
                  />
                ) : null}
              </ProjectSectionCard>
              <ProjectSectionCard>
                <ProjectOverviewTitle strong>{t('top-projects')}</ProjectOverviewTitle>
                <div style={{ marginTop: '0.5rem' }}>
                  {topProjects.length ? topProjects.map((project, index) => (
                    <TopProjectItem key={project.id}>
                      <Paragraph style={{ marginBottom: 0 }}>
                        <Text strong>
                          {`${index + 1}.`}
                        </Text>
                        {' '}
                        {project.link ? (
                          <Link href={project.link} target='_blank' rel='noreferrer'>
                            {project.title}
                          </Link>
                        ) : project.title}
                        {' '}
                        <Text type='secondary'>
                          (
                          {project.countryName}
                          )
                        </Text>
                      </Paragraph>
                      <TopProjectMeta>
                        <Text type='secondary'>
                          {t('direct-beneficiaries-short')}
                          {': '}
                          <Text strong>{formatSummaryNumber(project.directBeneficiaries)}</Text>
                        </Text>
                        <Text type='secondary'>
                          {t('budget-short')}
                          {': '}
                          <Text strong>
                            {formatSummaryNumber(project.budget)}
                            {' '}
                            USD
                          </Text>
                        </Text>
                      </TopProjectMeta>
                    </TopProjectItem>
                  )) : <Text type='secondary'>{t('no-projects-current-filters')}</Text>}
                </div>
              </ProjectSectionCard>
            </ProjectCardsGrid>
          </Profiler>
        ) : null}
        <div>
          <Profiler id='DataTable' onRender={logRenderPerf}>
            <DataTable countryLinkDict={countryLinkDict} projects={deferredTableProjects} />
          </Profiler>
        </div>
      </ExploreProjectsSection>
    </DashboardScope>
  );
};
