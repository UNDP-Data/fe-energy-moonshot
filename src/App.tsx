import {
  lazy, Suspense, useState, useEffect, useReducer, useRef, useCallback, useMemo,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  CountryGroupDataType,
  CountryMetadataRow,
  DashboardFilterKey,
  DashboardFilters,
  FilterCatalog,
  getAssetPath,
  IndicatorMetaDataType,
  ProjectLevelDataType,
} from './Types';
import Header from './Global/Header';
import Banner from './Global/Banner';
import Million from './Global/500million';
import Footer from './Global/Footer';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { DEFAULT_VALUES } from './Constants';
import {
  buildFilterCatalog,
  DEFAULT_DASHBOARD_FILTERS,
  normalizeCountryMetadata,
  normalizeProjectLevelData,
} from './utils/dashboardFilters';
import {
  getInitialLanguage,
  getLanguageDirection,
  isSupportedLanguage,
  loadTranslationResources,
} from './i18nConfig';

import './styles/style.css';

const WALKTHROUGH_APP_STATE_EVENT = 'moonshot-walkthrough-app-state-change';

const GlobalDashboard = lazy(() => import('./Global').then((module) => ({ default: module.Global })));
const CommentForm = lazy(() => import('./Global/CommentForm').then((module) => ({ default: module.CommentForm })));

declare global {
  interface Window {
    __moonshotWalkthroughState?: {
      applyState: (state: {
        dashboardFilters?: Partial<DashboardFilters>;
        language?: string;
        xAxisIndicator?: string;
      }) => void;
      getState: () => {
        dashboardFilters: DashboardFilters;
        language: string;
        xAxisIndicator: string;
      };
    };
  }
}

const VizAreaEl = styled.div`
  display: flex;
  max-width: 1220px;
  margin: auto;
  align-items: center;
  justify-content: center;
  height: 6.25rem;
`;

const DashboardLoader = styled(VizAreaEl)`
  min-height: 18rem;
  width: 100%;
`;

const DashboardLoadError = styled.div`
  background: #fff4f4;
  border: 1px solid #ffd0d0;
  color: #8a1f1f;
  margin: 2rem auto;
  max-width: 1220px;
  padding: 1rem;
`;

const parseCsvRows = (input: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (quoted && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && nextChar === '\n') index += 1;
      currentRow.push(currentValue);
      if (currentRow.some((value) => value !== '')) rows.push(currentRow);
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  if (currentRow.some((value) => value !== '')) rows.push(currentRow);
  const [headers = [], ...dataRows] = rows;
  return dataRows.map((row) => headers.reduce<Record<string, string>>((record, header, index) => {
    record[header] = row[index] || '';
    return record;
  }, {}));
};

const fetchJson = async <Value,>(url: string, signal: AbortSignal): Promise<Value> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load ${url}: ${response.status}`);
  return response.json();
};

const fetchCsvRows = async (url: string, signal: AbortSignal) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load ${url}: ${response.status}`);
  return parseCsvRows(await response.text());
};

const buildCountryGroupDataFromMetadata = (rows: CountryMetadataRow[]): CountryGroupDataType[] => (
  rows.map((row) => ({
    'Alpha-2 code': '',
    'Alpha-3 code': row['Country Code'],
    'Country or Area': row['Country Name'],
    'Development classification': '',
    'Group 1': row.Region || '',
    'Group 2': row['continent-region'] || '',
    'Group 3': row['sub-region'] || '',
    LDC: `${row.LDC || ''}`.trim() !== '',
    LLDC: `${row.LLDC || ''}`.trim() !== '',
    'Latitude (average)': 0,
    'Longitude (average)': 0,
    'Numeric code': Number(row.m49 || 0),
    SIDS: `${row.SIDS || ''}`.trim() !== '',
    'Income group': row.Economy || '',
    bbox: {
      ne: { lat: 0, lon: 0 },
      sw: { lat: 0, lon: 0 },
    },
  }))
);

interface Props {
  language: string;
}

const App = (props: Props) => {
  const { language } = props;
  const containerEl = useRef(null);
  const feedbackEl = useRef<HTMLDivElement | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => (
    getInitialLanguage(
      language,
      typeof window !== 'undefined'
        ? window.localStorage.getItem('moonshot-language') || undefined
        : undefined,
    )
  ));
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType[] | undefined>(undefined);
  const [indicatorsList, setIndicatorsList] = useState<IndicatorMetaDataType[] | undefined>(undefined);
  const [countryLinkDict, setCountryLinkDict] = useState<any>({});
  const [geojsonMapData, setGeojsonMapData] = useState<any[]>([]);
  const [projectLevelData, setProjectLevelData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [countryMetadata, setCountryMetadata] = useState<CountryMetadataRow[] | undefined>(undefined);
  const [filterCatalog, setFilterCatalog] = useState<FilterCatalog | undefined>(undefined);
  const [dashboardLoadError, setDashboardLoadError] = useState('');
  const [feedbackReady, setFeedbackReady] = useState(false);

  const initialState = {
    filters: DEFAULT_DASHBOARD_FILTERS,
    xAxisIndicator: DEFAULT_VALUES.firstMetric,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const updateDashboardFilter = useCallback((key: DashboardFilterKey, value: string) => {
    dispatch({
      type: 'UPDATE_DASHBOARD_FILTER',
      payload: {
        key,
        value,
      },
    });
  }, []);

  const applyDashboardFilters = useCallback((filters: Partial<DashboardFilters>) => {
    dispatch({
      type: 'APPLY_DASHBOARD_FILTERS',
      payload: filters,
    });
  }, []);

  const resetDashboardFilters = useCallback(() => {
    dispatch({
      type: 'RESET_DASHBOARD_FILTERS',
      payload: DEFAULT_DASHBOARD_FILTERS,
    });
  }, []);

  const updateXAxisIndicator = useCallback((xAxisIndicator: string) => {
    dispatch({
      type: 'UPDATE_X_AXIS_INDICATOR',
      payload: xAxisIndicator,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const appState = {
      dashboardFilters: state.filters,
      language: currentLanguage,
      xAxisIndicator: state.xAxisIndicator,
    };
    window.__moonshotWalkthroughState = {
      applyState: (nextState) => {
        if (nextState.dashboardFilters) {
          applyDashboardFilters(nextState.dashboardFilters);
        }
        if (nextState.xAxisIndicator) {
          updateXAxisIndicator(nextState.xAxisIndicator);
        }
        if (nextState.language && isSupportedLanguage(nextState.language)) {
          setCurrentLanguage(nextState.language);
        }
      },
      getState: () => appState,
    };
    window.dispatchEvent(new CustomEvent(WALKTHROUGH_APP_STATE_EVENT, {
      detail: appState,
    }));
    return () => {
      if (window.__moonshotWalkthroughState?.getState === undefined) return;
      delete window.__moonshotWalkthroughState;
    };
  }, [
    applyDashboardFilters,
    currentLanguage,
    state.filters,
    state.xAxisIndicator,
    updateXAxisIndicator,
  ]);

  // translation
  const { i18n } = useTranslation();
  useEffect(() => {
    let active = true;
    const applyLanguage = async () => {
      try {
        if (!i18n.hasResourceBundle(currentLanguage, 'translation')) {
          const translation = await loadTranslationResources(currentLanguage);
          if (!active) return;
          i18n.addResourceBundle(currentLanguage, 'translation', translation, true, true);
        }
        if (active) {
          await i18n.changeLanguage(currentLanguage);
        }
      } catch {
        if (active) {
          await i18n.changeLanguage('en');
        }
      }
    };

    applyLanguage();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('moonshot-language', currentLanguage);
    }

    if (typeof document !== 'undefined') {
      const direction = getLanguageDirection(currentLanguage);
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = direction;
      document.body.dir = direction;
    }
    return () => {
      active = false;
    };
  }, [currentLanguage, i18n]);

  useEffect(() => {
    const normalizedPreferredLanguage = language?.toLowerCase();
    if (
      isSupportedLanguage(normalizedPreferredLanguage)
      && normalizedPreferredLanguage !== currentLanguage
    ) {
      setCurrentLanguage(normalizedPreferredLanguage);
    }
  }, [currentLanguage, language]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('./LocalWalkthroughHook').then(({ installLocalWalkthroughHook }) => {
      if (cancelled) return;
      cleanup = installLocalWalkthroughHook();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const loadDashboardData = async () => {
      try {
        const [
          indicatorMetaData,
          projectLevelData1,
          countryMetadataRows,
          countryLinks,
          geoData,
        ] = await Promise.all([
          fetchJson<IndicatorMetaDataType[]>(getAssetPath('/data/indicatorMetaData.json'), controller.signal),
          fetchJson<any[]>(getAssetPath('/data/moonshotData.json'), controller.signal),
          fetchCsvRows(getAssetPath('/data/countryMetadata.csv'), controller.signal),
          fetchJson<any>(getAssetPath('/data/countrylinkdict.json'), controller.signal),
          fetchJson<any[]>(getAssetPath('/data/worldMap.json'), controller.signal),
        ]);
        if (!active) return;
        setProjectLevelData(normalizeProjectLevelData(projectLevelData1));
        const normalizedCountryMetadata = normalizeCountryMetadata(countryMetadataRows);
        setCountryMetadata(normalizedCountryMetadata);
        setFilterCatalog(buildFilterCatalog(normalizedCountryMetadata));
        setCountryGroupData(buildCountryGroupDataFromMetadata(normalizedCountryMetadata));
        setGeojsonMapData(geoData);
        setCountryLinkDict(countryLinks);
        setIndicatorsList(indicatorMetaData);
        setDashboardLoadError('');
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setDashboardLoadError(error instanceof Error ? error.message : 'Could not load dashboard data.');
      }
    };

    const timer = window.setTimeout(loadDashboardData, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const element = feedbackEl.current;
    if (!element || feedbackReady) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      const timer = window.setTimeout(() => setFeedbackReady(true), 1500);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setFeedbackReady(true);
        observer.disconnect();
      }
    }, {
      rootMargin: '700px 0px',
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [feedbackReady]);

  const contextValue = useMemo(() => ({
    ...state,
    updateDashboardFilter,
    applyDashboardFilters,
    resetDashboardFilters,
    updateXAxisIndicator,
  }), [
    applyDashboardFilters,
    resetDashboardFilters,
    state,
    updateDashboardFilter,
    updateXAxisIndicator,
  ]);
  const dashboardReady = Boolean(
    indicatorsList && countryGroupData && projectLevelData && countryMetadata && filterCatalog,
  );

  return (
    <div className='undp-container'>
      <Context.Provider
        value={contextValue}
      >
        <Header
          language={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
        <Banner />
        <Million />
        <div
          ref={containerEl}
          className='bodyEl padding-top-04 padding-bottom-01 padding-right-05 padding-left-05'
        >
          <div className='margin-bottom-07'>
            {dashboardLoadError ? (
              <DashboardLoadError id='tracker' data-walkthrough-target='dashboard'>
                {dashboardLoadError}
              </DashboardLoadError>
            ) : dashboardReady ? (
              <Suspense fallback={(
                <DashboardLoader id='tracker' data-walkthrough-target='dashboard'>
                  <div className='undp-loader' />
                </DashboardLoader>
              )}
              >
                <GlobalDashboard
                  countryGroupData={countryGroupData as CountryGroupDataType[]}
                  countryMetadata={countryMetadata as CountryMetadataRow[]}
                  filterCatalog={filterCatalog as FilterCatalog}
                  indicators={indicatorsList as IndicatorMetaDataType[]}
                  geojsonMapData={geojsonMapData}
                  countryLinkDict={countryLinkDict}
                  projectLevelData={projectLevelData as ProjectLevelDataType[]}
                  language={currentLanguage}
                  onLanguageChange={setCurrentLanguage}
                />
              </Suspense>
            ) : (
              <DashboardLoader id='tracker' data-walkthrough-target='dashboard'>
                <div className='undp-loader' />
              </DashboardLoader>
            )}
          </div>
        </div>
        <div style={{ background: '#F6F6F6' }} className='padding-top-07 padding-right-05 padding-left-05'>
          <hr className='undp-style light margin-top-05 margin-bottom-05' />
          <div ref={feedbackEl}>
            {feedbackReady ? (
              <Suspense fallback={(
                <VizAreaEl>
                  <div className='undp-loader' />
                </VizAreaEl>
              )}
              >
                <CommentForm />
              </Suspense>
            ) : null}
          </div>
        </div>
        <Footer />
      </Context.Provider>
    </div>
  );
};

export default App;
