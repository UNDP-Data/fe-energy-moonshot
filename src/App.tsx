/* eslint-disable jsx-a11y/iframe-has-title */
import {
  useState, useEffect, useReducer, useRef,
} from 'react';
import styled from 'styled-components';
import { json, csv } from 'd3-request';
import { queue } from 'd3-queue';
import { useTranslation } from 'react-i18next';
import {
  CountryGroupDataType, IndicatorMetaDataType, CountryIndicatorMetaDataType, CountryIndicatorDataType, CountryData, ProjectLevelDataType, ROOT_DIR,
} from './Types';
import { Global } from './Global';
import Header from './Global/Header';
import Banner from './Global/Banner';
import Million from './Global/500million';
import Footer from './Global/Footer';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { CommentForm } from './Global/CommentForm';
import Resources from './Global/Resources';
import { DEFAULT_VALUES } from './Constants';

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
  // console.log('language: ', language);
  const containerEl = useRef(null);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType[] | undefined>(undefined);
  const [indicatorsList, setIndicatorsList] = useState<IndicatorMetaDataType[] | undefined>(undefined);
  const [countryLinkDict, setCountryLinkDict] = useState<any>({});
  // const [regionList, setRegionList] = useState<RegionDataType[] | undefined>(undefined);
  const [countryList, setCountryList] = useState<string[] | undefined>(undefined);
  const [allCountriesData, setAllCountriesData] = useState<CountryData[] | undefined>(undefined);
  const [projectLevelData, setProjectLevelData] = useState<ProjectLevelDataType[] | undefined>(undefined);

  const initialState = {
    selectedRegions: 'all',
    selectedCountries: [],
    selectedProjects: '',
    selectedCategory: 'all',
    xAxisIndicator: DEFAULT_VALUES.firstMetric,
    selectedProjectType: 'All',
    selectedTaxonomy: 'All',
    selectedFunding: 'all',
    selectedGenderMarker: 'all',
    selectedSubCategory: 'all',
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const updateSelectedRegions = (selectedRegions: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_REGIONS',
      payload: selectedRegions,
    });
  };

  const updateSelectedFunding = (selectedFunding: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_FUNDING',
      payload: selectedFunding,
    });
  };

  const updateSelectedGenderMarker = (selectedGenderMarker: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_VARIOUS_TAXONOMY',
      payload: selectedGenderMarker,
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

  const updateSelectedTaxonomy = (selectedTaxonomy: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_TAXONOMY',
      payload: selectedTaxonomy,
    });
  };

  const updateSelectedCategory = (selectedCategory: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_CATEGORY',
      payload: selectedCategory,
    });
  };

  const updateSelectedSubCategory = (selectedSubCategory: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_SUBCATEGORY',
      payload: selectedSubCategory,
    });
  };

  function removeDuplicates(arr: any) {
    return arr.filter((item: any, index: number) => arr.indexOf(item) === index);
  }
  // translation
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(language);
    queue()
      .defer(json, `${ROOT_DIR}/data/indicatorMetaData.json`)
      .defer(csv, `${ROOT_DIR}/data/countryIndicatorMetadata.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data1.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data2.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data3.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data4.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data5.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data6.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data7.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data8.csv`)
      .defer(json, `${ROOT_DIR}/data/moonshotData.json`)
      .defer(json, 'https://raw.githubusercontent.com/UNDP-Data/country-taxonomy-from-azure/main/country_territory_groups.json')
      .defer(json, 'https://gist.githubusercontent.com/cplpearce/3bc5f1e9b1187df51d2085ffca795bee/raw/b36904c0c8ea72fdb82f68eb33f29891095deab3/country_codes')
      .defer(json, `${ROOT_DIR}/data/countrylinkdict.json`)
      .await((err: any, indicatorMetaData: IndicatorMetaDataType[], countryIndicatorMetadata: CountryIndicatorMetaDataType[], countryLevelData1: any[], countryLevelData2: any[], countryLevelData3: any[], countryLevelData4: any[], countryLevelData5: any[], countryLevelData6: any[], countryLevelData7: any[], countryLevelData8: any[], projectLevelData1: any[], countryGroupDataRaw: any[], countryBoundingBoxData: any, countryLinks: any) => {
        if (err) throw err;
        const countryIndicatorsData = [countryLevelData1, countryLevelData2, countryLevelData3, countryLevelData4, countryLevelData5, countryLevelData6, countryLevelData7, countryLevelData8];
        // const projectLevelDataWithNumbers = projectLevelData1.map((d) => ({
        //   ...d,
        //   'Grant amount': Number(d.Grant_amount.replaceAll(',', '')),
        //   'Energy Saved': Number(d.nrgSaved.replaceAll(',', '')),
        //   'target_Electricity access': +d['target_Electricity access'].replaceAll(',', ''),
        //   'target_Clean cooking': +d['target_Clean cooking'].replaceAll(',', ''),
        //   'target_Energy services': +d['target_Energy services'].replaceAll(',', ''),
        //   target_total: +d.target_total.replaceAll(',', ''),
        //   'results_Electricity access': +d['results_Electricity access'].replaceAll(',', ''),
        //   'results_Clean cooking': +d['results_Clean cooking'].replaceAll(',', ''),
        //   'results_Energy services': +d['results_Energy services'].replaceAll(',', ''),
        //   results_total: Number(d.results_total.replaceAll(',', '')),
        // }));
        setProjectLevelData(projectLevelData1);
        // here we need to have only the projects which are at projectLevelData

        // this can be used later probably
        /* const projectCoordsWithData = projectCoordsData.map((d) => ({
          ...d,
          projectData: projectLevelDataWithNumbers.filter((g) => g['projectID_PIMS+'] === d['projectID_PIMS+'])[0],
        })); */

        const countryGroupDataBbox = countryGroupDataRaw.map((d) => ({
          ...d,
          bbox: (countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()] !== undefined) ? countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()].boundingBox : {},
        }));
        setCountryGroupData(countryGroupDataBbox);
        const countries = removeDuplicates(projectLevelData1.map((d) => d.country));
        setCountryList(countries);
        setCountryLinkDict(countryLinks);
        const countriesData : CountryData[] = [];
        countries.forEach((country:string) => {
          const values : CountryIndicatorDataType[] = [];
          // looping through the 3 datasets
          countryIndicatorsData.forEach((dataSet, i) => {
            // filtering indicators related to the dataset
            const ind = countryIndicatorMetadata.filter((d) => Number(d.FileNumber) === i + 1);
            const countryData = dataSet.filter((d) => d.country === country)[0]; // filtering data for the country
            if (countryData !== undefined) ind.forEach((indRow) => values.push({ value: countryData[indRow.IndicatorLabelTable].replace(',', ''), year: countryData.year, indicator: indRow.Indicator })); // adding the values to the array
            else ind.forEach((indRow) => values.push({ value: 'n/a', year: 'n/a', indicator: indRow.Indicator }));
          });
          const countryData: CountryData = { country, values };
          countriesData.push(countryData);
        });
        setAllCountriesData(countriesData);
        // setRegionList(regions);
        setIndicatorsList(indicatorMetaData);
      });
    if (countryList && countryGroupData) {
      countryList.forEach((country) => {
        const index = countryGroupData.findIndex((d:any) => d['Country or Area'] === country);
        if (index < 0) {
          // eslint-disable-next-line no-console
          console.log('-------- country not found ------', country);
        }
      });
    }
  }, []);
  return (
    <div className='undp-container'>
      {
        indicatorsList && countryList && countryGroupData && allCountriesData && projectLevelData
          ? (
            <>
              <Context.Provider
                value={{
                  ...state,
                  updateSelectedRegions,
                  updateSelectedFunding,
                  updateSelectedGenderMarker,
                  updateSelectedCountries,
                  updateSelectedProjects,
                  updateXAxisIndicator,
                  updateSelectedTaxonomy,
                  updateSelectedCategory,
                  updateSelectedSubCategory,
                }}
              >
                <Header />
                <Banner />
                <Million />
                <div
                  ref={containerEl}
                  className='bodyEl padding-top-07 margin-bottom-07 padding-bottom-01 padding-right-05 padding-left-05'
                >
                  <div className='margin-bottom-07'>
                    <Global
                      countryGroupData={countryGroupData}
                      indicators={indicatorsList}
                      countryLinkDict={countryLinkDict}
                      projectLevelData={projectLevelData}
                    />
                  </div>
                </div>
                <div style={{ background: '#F6F6F6' }} className='padding-right-05 padding-left-05'>
                  <div>
                    <Resources />
                  </div>
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
