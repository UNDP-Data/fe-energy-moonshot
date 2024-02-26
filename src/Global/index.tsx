import { useContext } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CtxDataType,
  IndicatorMetaDataType,
  ProjectLevelDataType,
  IndicatorRange,
} from '../Types';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { UnivariateMap } from './UnivariateMap';
import { DataTable } from './DataTable';
import { MainText } from './MainText';

interface Props {
  countryGroupData: CountryGroupDataType[];
  indicators: IndicatorMetaDataType[];
  countryLinkDict:any;
  projectLevelData: ProjectLevelDataType[];
}

export const Global = (props: Props) => {
  const {
    countryGroupData,
    indicators,
    projectLevelData,
    countryLinkDict,
  } = props;
  const {
    selectedRegions,
    selectedFunding,
    selectedCategory,
    selectedSubCategory,
    selectedGenderMarker,
  } = useContext(Context) as CtxDataType;
  let filteredProjectData = [...projectLevelData];

  filteredProjectData = filteredProjectData.filter((d) => (
    (selectedFunding === 'all' || d.verticalFunded === (selectedFunding === 'vf'))
    && (selectedGenderMarker === 'all' || d.genderMarker === selectedGenderMarker)
    && d.outputs.some((o) => (
      (selectedCategory === 'all' || o.outputCategory === selectedCategory)
      && (selectedSubCategory === 'all' || o.beneficiaryCategory === selectedSubCategory)
      && (selectedSubCategory === 'all' || o.beneficiaryCategory === selectedSubCategory)
    ))
  ));
  const avaliableCountryList = Array.from(new Set(filteredProjectData.map((p) => p.countryCode)));
  if (selectedRegions !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.region === selectedRegions || d.incomeGroup === selectedRegions
    || d.hdiTier === selectedRegions || d.countryCode === selectedRegions || d.specialGroupings.includes(selectedRegions));
  }

  function calculateCountryTotals() {
    const groupedData = nest()
      .key((d: any) => d.countryCode)
      .entries(filteredProjectData);
    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Alpha-3 code'] === country.key)];
      const { region } = country.values[0];
      const numberOfProjects = country.values.length;
      const indTemp = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;
        let value;
        if (indicator.AggregationLevel === 'outputs') {
          value = sumBy(country.values, (project:any) => sumBy(project.outputs, (output:any) => {
            if (selectedCategory === 'all' || output.outputCategory === selectedCategory) {
              if (selectedSubCategory === 'all' || output.beneficiaryCategory === selectedSubCategory) {
                return output[indicatorName] || 0;
              }
              return 0;
            }
            return 0;
          }));
        } else {
          value = sumBy(country.values, (project:any) => project[indicatorName]) || 0;
        }
        return (
          {
            indicator: indicatorName,
            value,
          }
        );
      });
      indTemp[6].value = numberOfProjects;
      return ({
        ...countryGroup,
        region,
        indicatorsAvailable: indTemp.map((ind) => ind.indicator),
        indicators: indTemp,
        numberProjects: numberOfProjects,
      });
    });
    return (countryData);
  }
  const mapData = calculateCountryTotals();
  const countryList = projectLevelData.reduce((acum:string[], projectData) => {
    if (!acum.includes(projectData.countryCode)) {
      acum.push(projectData.countryCode);
    }
    return acum;
  }, []);
  function calculateRanges() {
    const ranges:IndicatorRange = mapData.reduce((acum:IndicatorRange, country) => {
      country.indicatorsAvailable.forEach((indAva:string) => {
        const value = country.indicators.find((ind) => ind.indicator === indAva);
        if (value) {
          acum[indAva].push(value.value);
        }
      });
      return acum;
    }, indicators.reduce((acum, indi:IndicatorMetaDataType) => ({
      ...acum,
      [indi.DataKey]: [],
    }), {}));
    indicators.forEach((indi:IndicatorMetaDataType) => {
      ranges[indi.DataKey].sort((a:number, b:number) => a - b);
      const q = Math.ceil((ranges[indi.DataKey].length - 1) / 9);
      let i = 1;
      const legendArray = [];
      do {
        const numstr = Math.ceil(ranges[indi.DataKey][i * q]).toString();
        const num = parseInt(numstr[0] + '0'.repeat(numstr.length - 1), 10);
        legendArray.push(num);
        i += 1;
      } while (i * q < ranges[indi.DataKey].length - 1);
      ranges[indi.DataKey] = Array.from(new Set(legendArray));
    });
    return ranges;
  }

  const binningRangeLarge = calculateRanges();
  return (
    <>
      <div id='tracker' className='flex-div flex-wrap padding-top-06'>
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <h2 className='undp-typography margin-bottom-05 page-title'>
            <span style={{ color: 'var(--dark-yellow)' }}>
              Energy Moonshot
            </span>
            {' '}
            Tracker
          </h2>
          <h5 className='undp-typography'>
            Select filters to analyze beneficiary targets of
            {' '}
            <b>
              UNDP energy-related projects
            </b>
            {' '}
            active during the Strategic Plan
            {' '}
            <b>
              2022-2025:
            </b>
            {' '}
          </h5>
          <Settings
            countryList={countryList}
          />
          <MainText />
          <Cards
            data={mapData}
          />
          <div style={{ backgroundColor: 'var(--gray-200)' }}>
            <UnivariateMap
              avaliableCountryList={avaliableCountryList}
              data={mapData}
              indicators={indicators}
              binningRangeLarge={binningRangeLarge}
            />
          </div>
        </div>
      </div>
      <hr className='undp-style light' />
      <div>
        <DataTable countryLinkDict={countryLinkDict} projects={filteredProjectData} />
      </div>
    </>
  );
};
