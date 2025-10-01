import { useContext, useEffect } from 'react';
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
import { BarFilters } from './BarFilters';
import { UnivariateMap } from './UnivariateMap';
import { DataTable } from './DataTable';
/* import { MainText } from './MainText'; */

interface Props {
  countryGroupData: CountryGroupDataType[];
  indicators: IndicatorMetaDataType[];
  geojsonMapData: any[];
  countryLinkDict: any;
  projectLevelData: ProjectLevelDataType[];
}

export const Global = (props: Props) => {
  const {
    countryGroupData,
    indicators,
    geojsonMapData,
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

  const notOtherRegions = ['SIDS', 'LDC', 'LLDC'];

  // Helper function to determine if an output should be included
  const shouldIncludeOutput = (output: any) => {
    if (selectedCategory === 'all') return true;

    // If Energy Access is selected and subcategory is Clean Electricity,
    // include both Energy Access outputs with Clean Electricity AND all Energy Transition outputs
    if (selectedCategory === 'Energy Access' && selectedSubCategory === 'Clean Electricity') {
      return (output.outputCategory === 'Energy Access' && output.beneficiaryCategory === 'Clean Electricity')
             || output.outputCategory === 'Energy Transition';
    }

    // For all other cases, use the original logic
    if (output.outputCategory === selectedCategory) {
      return selectedSubCategory === 'all' || output.beneficiaryCategory === selectedSubCategory;
    }

    return false;
  };

  useEffect(() => {
    if (countryGroupData) {
      console.log(countryGroupData);
    }
  }, [countryGroupData]);

  filteredProjectData = filteredProjectData.filter((d) => ((selectedFunding === 'all' || d.verticalFunded === (selectedFunding === 'Vertical funds' || selectedFunding === 'vf'))
    && (selectedGenderMarker === 'all' || d.genderMarker === selectedGenderMarker)
    && d.outputs.some((o) => shouldIncludeOutput(o))
  ));
  const avaliableCountryList = Array.from(new Set(filteredProjectData.map((p) => p.countryCode)));
  if (selectedRegions !== 'all') {
    if (selectedRegions.toLowerCase() === 'other') {
      filteredProjectData = filteredProjectData.filter((d) => !d.specialGroupings.some((el) => notOtherRegions.includes(el)));
    } else {
      filteredProjectData = filteredProjectData.filter((d) => d.region === selectedRegions || d.incomeGroup === selectedRegions
        || d.hdiTier === selectedRegions || d.countryCode === selectedRegions || d.specialGroupings.includes(selectedRegions));
    }
  }

  function calculateCountryTotals() {
    // Use all project data for country grouping, but apply category filtering to values
    let dataForGrouping = [...projectLevelData];

    // Apply non-category filters (funding, gender marker, regions)
    dataForGrouping = dataForGrouping.filter((d) => ((selectedFunding === 'all' || d.verticalFunded === (selectedFunding === 'Vertical funds' || selectedFunding === 'vf'))
      && (selectedGenderMarker === 'all' || d.genderMarker === selectedGenderMarker)
    ));

    if (selectedRegions !== 'all') {
      if (selectedRegions.toLowerCase() === 'other') {
        dataForGrouping = dataForGrouping.filter((d) => !d.specialGroupings.some((el) => notOtherRegions.includes(el)));
      } else {
        dataForGrouping = dataForGrouping.filter((d) => d.region === selectedRegions || d.incomeGroup === selectedRegions
          || d.hdiTier === selectedRegions || d.countryCode === selectedRegions || d.specialGroupings.includes(selectedRegions));
      }
    }

    const groupedData = nest()
      .key((d: any) => d.countryCode)
      .entries(dataForGrouping);
    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Alpha-3 code'] === country.key)];
      const { region } = country.values[0];

      // Count projects that have outputs matching category filter
      const numberOfProjects = country.values.filter((project: any) => project.outputs.some((o: any) => shouldIncludeOutput(o))).length;

      const indTemp = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;
        let value;
        if (indicator.AggregationLevel === 'outputs') {
          value = sumBy(country.values, (project: any) => sumBy(project.outputs, (output: any) => {
            if (shouldIncludeOutput(output)) {
              return output[indicatorName] || 0;
            }
            return 0;
          }));
        } else {
          // For project-level indicators, only count projects that have matching outputs
          value = sumBy(country.values.filter((project: any) => project.outputs.some((o: any) => shouldIncludeOutput(o))), (project: any) => project[indicatorName]) || 0;
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
  const countryList = projectLevelData.reduce((acum: string[], projectData) => {
    if (!acum.includes(projectData.countryCode)) {
      acum.push(projectData.countryCode);
    }
    return acum;
  }, []);
  function calculateRanges() {
    const ranges: IndicatorRange = mapData.reduce((acum: IndicatorRange, country) => {
      country.indicatorsAvailable.forEach((indAva: string) => {
        const value = country.indicators.find((ind) => ind.indicator === indAva);
        if (value) {
          acum[indAva].push(value.value);
        }
      });
      return acum;
    }, indicators.reduce((acum, indi: IndicatorMetaDataType) => ({
      ...acum,
      [indi.DataKey]: [],
    }), {}));
    indicators.forEach((indi: IndicatorMetaDataType) => {
      ranges[indi.DataKey].sort((a: number, b: number) => a - b);
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
          <Settings />
          <div>
            {/* <MainText /> */}
            <Cards
              data={mapData}
            />
          </div>
          <div className='flex-div'>
            <div style={{ maxWidth: '30%', width: '30%' }}>
              <BarFilters
                data={filteredProjectData}
                countryList={countryList}
              />
            </div>
            <div style={{ maxWidth: '70%', width: '70%' }}>
              <div style={{ backgroundColor: 'var(--gray-200)' }}>
                <UnivariateMap
                  avaliableCountryList={avaliableCountryList}
                  geojsonMapData={geojsonMapData}
                  data={mapData}
                  indicators={indicators}
                  binningRangeLarge={binningRangeLarge}
                />
              </div>
            </div>
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
