import {
  useState, useEffect, useReducer, useRef, useCallback, useMemo,
} from 'react';
import styled from 'styled-components';
import { json, csv } from 'd3-request';
import { queue } from 'd3-queue';
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
import { Global } from './Global';
import Header from './Global/Header';
import Banner from './Global/Banner';
import Million from './Global/500million';
import Footer from './Global/Footer';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { CommentForm } from './Global/CommentForm';
// import Resources from './Global/Resources';
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
} from './i18nConfig';

import './styles/style.css';

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

const VizAreaEl = styled.div`
  display: flex;
  max-width: 1220px;
  margin: auto;
  align-items: center;
  justify-content: center;
  height: 6.25rem;
`;

interface Props {
  language: string;
}

const App = (props: Props) => {
  const { language } = props;
  const containerEl = useRef(null);
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

  const initialState = {
    filters: DEFAULT_DASHBOARD_FILTERS,
    xAxisIndicator: DEFAULT_VALUES.firstMetric,
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const startFilterTransitionLog = useCallback((label: string, payload: unknown) => {
    if (typeof window === 'undefined') return;
    const startedAt = window.performance.now();
    const id = ((window as any).__moonshotFilterPerfId || 0) + 1;
    (window as any).__moonshotFilterPerfId = id;
    (window as any).__moonshotFilterPerf = {
      completed: false,
      id,
      label,
      payload,
      startedAt,
      steps: [],
    };
    // eslint-disable-next-line no-console
    console.groupCollapsed(`[Moonshot filter transition #${id}] ${label} started`);
    // eslint-disable-next-line no-console
    console.log('dispatch payload', payload, {
      startedAt: `${startedAt.toFixed(1)}ms`,
    });
  }, []);

  const updateDashboardFilter = useCallback((key: DashboardFilterKey, value: string) => {
    startFilterTransitionLog(`updateDashboardFilter(${key})`, { key, value });
    dispatch({
      type: 'UPDATE_DASHBOARD_FILTER',
      payload: {
        key,
        value,
      },
    });
  }, [startFilterTransitionLog]);

  const applyDashboardFilters = useCallback((filters: Partial<DashboardFilters>) => {
    startFilterTransitionLog('applyDashboardFilters', filters);
    dispatch({
      type: 'APPLY_DASHBOARD_FILTERS',
      payload: filters,
    });
  }, [startFilterTransitionLog]);

  const resetDashboardFilters = useCallback(() => {
    startFilterTransitionLog('resetDashboardFilters', DEFAULT_DASHBOARD_FILTERS);
    dispatch({
      type: 'RESET_DASHBOARD_FILTERS',
      payload: DEFAULT_DASHBOARD_FILTERS,
    });
  }, [startFilterTransitionLog]);

  const updateXAxisIndicator = useCallback((xAxisIndicator: string) => {
    dispatch({
      type: 'UPDATE_X_AXIS_INDICATOR',
      payload: xAxisIndicator,
    });
  }, []);

  // translation
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('moonshot-language', currentLanguage);
    }

    if (typeof document !== 'undefined') {
      const direction = getLanguageDirection(currentLanguage);
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = direction;
      document.body.dir = direction;
    }
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
    queue()
      .defer(json, getAssetPath('/data/indicatorMetaData.json'))
      .defer(json, getAssetPath('/data/moonshotData.json'))
      .defer(csv, getAssetPath('/data/countryMetadata.csv'))
      .defer(json, 'https://raw.githubusercontent.com/UNDP-Data/country-taxonomy-from-azure/main/country_territory_groups.json')
      .defer(json, 'https://gist.githubusercontent.com/cplpearce/3bc5f1e9b1187df51d2085ffca795bee/raw/b36904c0c8ea72fdb82f68eb33f29891095deab3/country_codes')
      .defer(json, getAssetPath('/data/countrylinkdict.json'))
      .defer(json, getAssetPath('/data/worldMap.json'))
      .await((
        err: any,
        indicatorMetaData: IndicatorMetaDataType[],
        projectLevelData1: any[],
        countryMetadataRows: any[],
        countryGroupDataRaw: any[],
        countryBoundingBoxData: any,
        countryLinks: any,
        geoData: any,
      ) => {
        if (err) throw err;
        setProjectLevelData(normalizeProjectLevelData(projectLevelData1));
        const normalizedCountryMetadata = normalizeCountryMetadata(countryMetadataRows);
        setCountryMetadata(normalizedCountryMetadata);
        setFilterCatalog(buildFilterCatalog(normalizedCountryMetadata));

        const countryGroupDataBbox = countryGroupDataRaw.map((d) => ({
          ...d,
          bbox: (countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()] !== undefined) ? countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()].boundingBox : {},
        }));
        setCountryGroupData(countryGroupDataBbox);
        setGeojsonMapData(geoData);
        setCountryLinkDict(countryLinks);
        setIndicatorsList(indicatorMetaData);
      });
  }, []);

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
  return (
    <div className='undp-container'>
      {
        indicatorsList && countryGroupData && projectLevelData && countryMetadata && filterCatalog
          ? (
            <>
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
                    <Global
                      countryGroupData={countryGroupData}
                      countryMetadata={countryMetadata}
                      filterCatalog={filterCatalog}
                      indicators={indicatorsList}
                      geojsonMapData={geojsonMapData}
                      countryLinkDict={countryLinkDict}
                      projectLevelData={projectLevelData}
                    />
                  </div>
                </div>
                <div style={{ background: '#F6F6F6' }} className='padding-top-07 padding-right-05 padding-left-05'>
                  {
                    // <div>
                    //   <Resources />
                    // </div>
                  }
                  <hr className='undp-style light margin-top-05 margin-bottom-05' />
                  <div>
                    <CommentForm />
                  </div>
                </div>
                <Footer />
              </Context.Provider>
            </>
          )
          : (
            <VizAreaEl>
              <div className='undp-loader' />
            </VizAreaEl>
          )
      }
    </div>
  );
};

export default App;
