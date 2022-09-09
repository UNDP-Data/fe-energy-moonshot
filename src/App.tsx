/* eslint-disable jsx-a11y/iframe-has-title */
import {
  useState, useEffect, useReducer, useRef,
} from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { json } from 'd3-request';
// import sortBy from 'lodash.sortby';
// import uniqBy from 'lodash.uniqby';
import { queue } from 'd3-queue';
import { Spin } from 'antd';
import 'antd/dist/antd.css';
import {
  ProjectDataType, CountryGroupDataType, IndicatorMetaDataType, ProjectCoordinateDataType, RegionDataType, ROOT_DIR,
} from './Types';
import { GrapherComponent } from './GrapherComponent';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { DEFAULT_VALUES } from './Constants';

const GlobalStyle = createGlobalStyle`
  :root {
    --white: #FFFFFF;
    --primary-blue: #006EB5;
    --blue-medium: #4F95DD;
    --blue-bg: #94C4F5;
    --navy: #082753;
    --black-100: #f7f7f7;
    --black-200: #f5f9fe;
    --black-300: #EDEFF0;
    --black-400: #E9ECF6;
    --black-450: #DDD;
    --black-500: #A9B1B7;
    --black-550: #666666;
    --black-600: #212121;
    --black-700: #000000;
    --blue-very-light: #F2F7FF;
    --yellow: #ffeb00;
    --yellow-bg: #FFE17E;
    --red: #D12800;
    --red-bg: #FFBCB7;
    --shadow:0px 10px 30px -10px rgb(9 105 250 / 15%);
    --shadow-bottom: 0 10px 13px -3px rgb(9 105 250 / 5%);
    --shadow-top: 0 -10px 13px -3px rgb(9 105 250 / 15%);
    --shadow-right: 10px 0px 13px -3px rgb(9 105 250 / 5%);
    --shadow-left: -10px 0px 13px -3px rgb(9 105 250 / 15%);
  }
  
  html { 
    font-size: 62.5%; 
  }

  .react-dropdown-select-option{
    color:var(--black) !important;
    background-color:var(--primary-color-light) !important;
  }
  .react-dropdown-select-option-label, .react-dropdown-select-option-remove{
    font-weight: 400;
    background-color:var(--primary-color-light);
    padding: 0.5rem;
  }

  body {
    font-family: "proxima-nova", "Helvetica Neue", "sans-serif";
    color: var(--black-600);
    background-color: var(--white);
    margin: 0;
    padding: 1rem 0;
    font-size: 1.6rem;
    font-weight: normal;
    line-height: 2.56rem;
  }

  a {
    text-decoration: none;
    color: var(--primary-blue);
  }

  h1 {
    color: var(--primary-blue);
    font-size: 3.2rem;
    font-weight: 700;
    
    @media (max-width: 760px) {
      font-size: 2.4rem;
    }
    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }
  
  button.primary {
    border-radius: 0.2rem !important;
    font-size: 1.4rem !important;
    font-weight: normal !important;
    color: var(--white) !important;
    background-color: var(--primary-blue) !important;
    border: 1px solid var(--primary-blue) !important;
    cursor: pointer !important;
    padding: 0.4rem 1rem !important;
    &:hover {
      border: 1px solid var(--blue-medium) !important;
      background-color: var(--blue-medium) !important;
    }
    &:active{
      border: 1px solid var(--blue-medium) !important;
      background-color: var(--blue-medium) !important;
    }
  }

  button.secondary {
    border-radius: 0.2rem !important;
    font-size: 1.4rem !important;
    font-weight: normal !important;
    color: var(--black-600) !important;
    border: 1px solid var(--black-450) !important;
    cursor: pointer !important;
    padding: 0.4rem 1rem !important;
    background-color: var(--white) !important;
    &:hover {
      border: 1px solid var(--primary-blue) !important;
      color: var(--primary-blue) !important;
    }
    &:active{
      border: 1px solid var(--primary-blue) !important;
      color: var(--primary-blue) !important;
    }
  }

  a:hover {
    font-weight: bold;
  }

  .bold{
    font-weight: 700;
  }
  
  .italics{
    font-style: italic;
  }

  .select-box-option .ant-select-item-option-content {
    white-space: normal !important;
    font-size: 1.6rem !important;
    line-height: 2.24rem !important;
    padding: 1.6rem 0 !important;
  }
  
  .select-box {
    width: 100%;
    border: 2px solid #000;
    min-height: 5.2rem;
  }

  .ant-select-selector{
    min-height: 4.8rem !important;
    border: 0 !important;
  }

  .select-box .ant-select-selection-placeholder {
    font-size: 1.6rem;
    text-transform: uppercase;
    color: black;
  }

  .select-box::after {
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transition: translateY(-50%);
    -webkit-transition: all 200ms ease-in-out;
    -moz-transition: all 200ms ease-in-out;
    -ms-transition: all 200ms ease-in-out;
    -o-transition: all 200ms ease-in-out;
    transition: all 200ms ease-in-out;
    background: url(https://design.undp.org/static/media/chevron-down.16c97a3f.svg) no-repeat center center;
    content: "";
    float: right;
    height: 13px;
    position: absolute;
    pointer-events: none;
    right: 14px;
    top: 50%;
    width: 20px;
  }

  .select-box .ant-select-selection-item {
    font-size: 1.6rem;
    font-weight: 600;
    text-transform: uppercase;
    color: black;
    padding: 0.9rem 3rem 0 0 !important;
  }

  .select-box .ant-select-selection-search-input {
    padding: 1.4rem 3rem 0 0 !important;
  }

  .ant-select-arrow {
    opacity: 0;
  }

  .ant-select-item-option {
    font-size: 1.6rem;
    border-top: 1px solid #d4d6d8;
    line-height: 4.4rem;
  }

  .single-select-box .ant-select-selector {
    padding-top: 1rem !important;
  }

  .ant-select-single .ant-select-selector::after, .ant-select-single .ant-select-selector .ant-select-selection-item::after, .ant-select-single .ant-select-selector .ant-select-selection-placeholder::after {
    content: none !important;
  }

  .undp-checkbox-el {
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover{
      .undp-checkbox{
        border: 2px solid #FFBCB7 !important;
      }
    }
  }

  .undp-checkbox {
    -webkit-appearance: none;
    appearance: none;
    border: 2px solid #d12800;
    cursor: pointer;
    height: 16px;
    margin: 0;
    width: 16px;
  }

  .undp-checkbox-checked {
    background: url(https://design.undp.org/static/media/icon-check.b332b98d.svg) 1px 0 no-repeat;
  }

  .undp-checkbox-label {
    font-size: 1.6rem;
    margin: 0 0.7rem;
    line-height: 1.6rem;
  }


`;

const VizAreaEl = styled.div`
  display: flex;
  max-width: 1220px;
  margin: auto;
  align-items: center;
  justify-content: center;
  height: 10rem;
`;

const App = () => {
  const [finalData, setFinalData] = useState<ProjectDataType[] | undefined>(undefined);
  const containerEl = useRef(null);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType[] | undefined>(undefined);
  const [projectCoordinatesData, setProjectCoordinatesData] = useState<ProjectCoordinateDataType[] | undefined>(undefined);
  const [indicatorsList, setIndicatorsList] = useState<IndicatorMetaDataType[] | undefined>(undefined);
  const [regionList, setRegionList] = useState<RegionDataType[] | undefined>(undefined);
  const [countryList, setCountryList] = useState<string[] | undefined>(undefined);

  const queryParams = new URLSearchParams(window.location.search);
  const initialState = {
    selectedRegions: queryParams.get('region') || 'All',
    selectedCountries: [],
    selectedProjects: '',
    xAxisIndicator: DEFAULT_VALUES.firstMetric,
    showProjectLocations: false,
    selectedProjectType: 'All',
    selectedTaxonomy: 'All',
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const indicatorsToExclude = [
    'HA directly impacted',
    'People indirectly benefiting',
    'Tonnes of CO2 emissions reduced in agriculture and forestry',
    'Tonnes of CO2-eq emissions reduced from buildings, cities, industries and appliances',
    'MJ of energy saved through improved efficiency',
  ];

  const regions = [
    { value: 'RBA', label: 'Regional Bureau for Africa (RBA)' },
    { value: 'RBAP', label: 'Regional Bureau for Asia and the Pacific (RBAP)' },
    { value: 'RBAS', label: 'Regional Bureau for Arab States (RBAS)' },
    { value: 'RBEC', label: 'Regional Bureau for Europe and the Commonwealth of Independent States (RBEC)' },
    { value: 'RBLAC', label: 'Regional Bureau on Latin America and the Caribbean (RBLAC)' },
  ];

  const updateSelectedRegions = (selectedRegions: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_REGIONS',
      payload: selectedRegions,
    });
  };

  const updateSelectedCountries = (selectedCountries: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_COUNTRIES',
      payload: selectedCountries,
    });
  };

  const updateSelectedProjects = (selectedProjects: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_PROJECTS',
      payload: selectedProjects,
    });
  };

  const updateXAxisIndicator = (xAxisIndicator: string) => {
    dispatch({
      type: 'UPDATE_X_AXIS_INDICATOR',
      payload: xAxisIndicator,
    });
  };

  const updateShowProjectLocations = (showProjectLocations: boolean) => {
    dispatch({
      type: 'UPDATE_SHOW_PROJECT_LOCATIONS',
      payload: showProjectLocations,
    });
  };

  const updateSelectedTaxonomy = (selectedTaxonomy: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_TAXONOMY',
      payload: selectedTaxonomy,
    });
  };
  useEffect(() => {
    if (containerEl.current && window.top) {
      const message = { height: document.body.scrollHeight, width: document.body.scrollWidth };
      window.top.postMessage(message, '*');
    }
  }, [containerEl.current, window.top]);

  useEffect(() => {
    queue()
      .defer(json, `${ROOT_DIR}/data/projects.json`)
      .defer(json, `${ROOT_DIR}/data/indicatorMetaData.json`)
      .defer(json, `${ROOT_DIR}/data/projectCoordinates.json`)
      .defer(json, 'https://raw.githubusercontent.com/UNDP-Data/Country-Taxonomy/main/country-territory-groups.json')
      .await((err: any, projectData: any[], indicatorMetaData: IndicatorMetaDataType[], projectCoordinates: ProjectCoordinateDataType[], countryGroupDataRaw: CountryGroupDataType[]) => {
        if (err) throw err;
        const projectCoordinateDataWithTaxonomy = projectCoordinates.map((d) => {
          const indx = projectData.findIndex((el) => el.project_id === d.project_id);
          const taxonomy = indx !== -1 ? projectData[indx].taxonomy_level3 : undefined;
          return ({ ...d, taxonomy });
        });
        setFinalData(projectData);
        setCountryGroupData(countryGroupDataRaw);
        setProjectCoordinatesData(projectCoordinateDataWithTaxonomy);
        setCountryList(projectData.map((d) => d['Lead Country']));
        setRegionList(regions);
        setIndicatorsList(indicatorMetaData.filter((d) => indicatorsToExclude.indexOf(d.Indicator) === -1));
      });
  }, []);
  return (
    <>
      <GlobalStyle />
      {
        indicatorsList && finalData && regionList && countryList && projectCoordinatesData && countryGroupData
          ? (
            <>
              <Context.Provider
                value={{
                  ...state,
                  updateSelectedRegions,
                  updateSelectedCountries,
                  updateSelectedProjects,
                  updateXAxisIndicator,
                  updateShowProjectLocations,
                  updateSelectedTaxonomy,
                }}
              >
                <div
                  ref={containerEl}
                >
                  <GrapherComponent
                    data={finalData}
                    countryGroupData={countryGroupData}
                    projectCoordinatesData={projectCoordinatesData}
                    indicators={indicatorsList}
                    regions={regionList}
                  />
                </div>
              </Context.Provider>
            </>
          )
          : (
            <VizAreaEl>
              <Spin size='large' />
            </VizAreaEl>
          )
      }
    </>
  );
};

export default App;
