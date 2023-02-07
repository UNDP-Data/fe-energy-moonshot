/* eslint-disable jsx-a11y/iframe-has-title */
import {
  useState, useEffect, useReducer, useRef,
} from 'react';
import styled from 'styled-components';
import { json, csv } from 'd3-request';
import { queue } from 'd3-queue';
import { Tabs } from 'antd';
import {
  CountryGroupDataType, IndicatorMetaDataType, RegionDataType, CountryIndicatorMetaDataType, CountryIndicatorDataType, CountryData, ProjectLevelDataType, ProjectCoordsDataType, ROOT_DIR,
} from './Types';
import { GrapherComponent } from './GrapherComponent';
import { ProjectsTable } from './GrapherComponent/ProjectsTable';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { DEFAULT_VALUES } from './Constants';

const VizAreaEl = styled.div`
  display: flex;
  max-width: 1220px;
  margin: auto;
  align-items: center;
  justify-content: center;
  height: 6.25rem;
`;

const App = () => {
  const containerEl = useRef(null);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType[] | undefined>(undefined);
  const [indicatorsList, setIndicatorsList] = useState<IndicatorMetaDataType[] | undefined>(undefined);
  const [regionList, setRegionList] = useState<RegionDataType[] | undefined>(undefined);
  const [countryList, setCountryList] = useState<string[] | undefined>(undefined);
  const [allCountriesData, setAllCountriesData] = useState<CountryData[] | undefined>(undefined);
  const [projectLevelData, setProjectLevelData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [projectCoords, setProjectCoordsData] = useState<ProjectCoordsDataType[] | undefined>(undefined);

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
  function removeDuplicates(arr: any) {
    return arr.filter((item: any, index: number) => arr.indexOf(item) === index);
  }
  useEffect(() => {
    queue()
      .defer(json, `${ROOT_DIR}/data/indicatorMetaData.json`)
      .defer(csv, `${ROOT_DIR}/data/countryIndicatorMetadata.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data1.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data2.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data3.csv`)
      .defer(csv, `${ROOT_DIR}/data/project_level_data1.csv`)
      .defer(csv, `${ROOT_DIR}/data/project_level_data2.csv`)
      .defer(json, 'https://raw.githubusercontent.com/UNDP-Data/country-taxonomy-from-azure/main/country_territory_groups.json')
      .await((err: any, indicatorMetaData: IndicatorMetaDataType[], countryIndicatorMetadata: CountryIndicatorMetaDataType[], countryLevelData1: any[], countryLevelData2: any[], countryLevelData3: any[], projectLevelData1: any[], projectCoordsData: ProjectCoordsDataType[], countryGroupDataRaw: CountryGroupDataType[]) => {
        if (err) throw err;
        const countryIndicatorsData = [countryLevelData1, countryLevelData2, countryLevelData3];
        const projectLevelDataWithNumbers = projectLevelData1.map((d) => ({
          ...d,
          'Grant amount': Number(d.Grant_amount.replaceAll(',', '')),
          'target_Electricity access': +d['target_Electricity access'].replaceAll(',', ''),
          'target_Clean cooking': +d['target_Clean cooking'].replaceAll(',', ''),
          'target_Energy services': +d['target_Energy services'].replaceAll(',', ''),
          target_total: +d.target_total.replaceAll(',', ''),
          'results_Electricity access': +d['results_Electricity access'].replaceAll(',', ''),
          'results_Clean cooking': +d['results_Clean cooking'].replaceAll(',', ''),
          'results_Energy services': +d['results_Energy services'].replaceAll(',', ''),
          results_total: Number(d.results_total.replaceAll(',', '')),
        }));
        setProjectLevelData(projectLevelDataWithNumbers);
        // here we need to have only the projects which are in the projectLevelData
        const projectCoordsWithData: ProjectCoordsDataType[] = [];
        projectCoordsData.forEach((d: any) => {
          const index = projectLevelDataWithNumbers.findIndex((el: ProjectLevelDataType) => el['projectID_PIMS+'] === d['projectID_PIMS+']);
          if (index > 0) {
            projectCoordsWithData.push({
              ...d,
              projectData: projectLevelDataWithNumbers[index],
            });
          }
        });
        // eslint-disable-next-line no-console
        // console.log('projectCoordsWithDAta', projectCoordsWithData);
        // this can be used later probably
        /* const projectCoordsWithData = projectCoordsData.map((d) => ({
          ...d,
          projectData: projectLevelDataWithNumbers.filter((g) => g['projectID_PIMS+'] === d['projectID_PIMS+'])[0],
        })); */
        setProjectCoordsData(projectCoordsWithData);
        setCountryGroupData(countryGroupDataRaw);
        setCountryList(removeDuplicates(projectLevelDataWithNumbers.map((d) => d['Lead Country'])));
        const countriesData : CountryData[] = [];
        countryLevelData1.map((d) => d.country).forEach((country) => {
          const values : CountryIndicatorDataType[] = [];
          // looping through the 3 datasets
          countryIndicatorsData.forEach((dataSet, i) => {
            // filtering indicators related to the dataset
            const ind = countryIndicatorMetadata.filter((d) => Number(d.FileNumber) === i + 1);
            const data = dataSet.filter((d) => d.country === country); // filtering data for the country
            data.forEach((countryData) => {
              ind.forEach((indRow) => {
                const value: CountryIndicatorDataType = { value: Number(countryData[indRow.IndicatorLabelTable].replace(',', '')), year: countryData.year, indicator: indRow.Indicator };
                values.push(value); // adding the values to the array
              });
            });
          });
          const countryData: CountryData = { country, values };
          countriesData.push(countryData);
        });
        setAllCountriesData(countriesData);
        setRegionList(regions);
        setIndicatorsList(indicatorMetaData.filter((d) => indicatorsToExclude.indexOf(d.Indicator) === -1));
      });
  }, []);
  return (
    <div className='undp-container'>
      {
        indicatorsList && regionList && countryList && countryGroupData && allCountriesData && projectLevelData && projectCoords
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
                  className='bodyEl'
                >
                  <div className='margin-bottom07'>
                    <Tabs
                      defaultActiveKey='1'
                      className='undp-tabs'
                      items={[
                        {
                          label: 'World Overview',
                          key: '1',
                          children: <GrapherComponent
                            countryGroupData={countryGroupData}
                            indicators={indicatorsList}
                            regions={regionList}
                            countries={countryList}
                            countriesData={allCountriesData}
                            projectLevelData={projectLevelData}
                            projectCoordsData={projectCoords}
                          />,
                        },
                        {
                          label: 'Country Profiles',
                          key: '2',
                          children: <ProjectsTable
                            data={projectLevelData}
                            countries={countryList}
                            countriesData={allCountriesData}
                          />,
                        },
                      ]}
                    />
                  </div>
                </div>
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
