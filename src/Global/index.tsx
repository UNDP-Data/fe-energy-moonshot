import { useContext } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CtxDataType,
  IndicatorMetaDataType,
  // RegionDataType,
  ProjectLevelDataType,
  ProjectCoordsDataType,
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
  // regions: RegionDataType[];
  projectLevelData: ProjectLevelDataType[];
  projectCoordsData: ProjectCoordsDataType[];
}

export const Global = (props: Props) => {
  const {
    countryGroupData,
    indicators,
    projectLevelData,
    projectCoordsData,
  } = props;
  const {
    selectedRegions,
    selectedFunding,
    selectedCategory,
    selectedSubCategory,
    selectedVariousTaxonomy,
  } = useContext(Context) as CtxDataType;
  let filteredProjectData = [...projectLevelData];
  if (selectedCategory !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.outputs.some((o) => o.outputCategory === selectedCategory));
  }
  if (selectedSubCategory !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.outputs.some((o) => o.beneficiaryCategory === selectedSubCategory));
  }
  if (selectedCategory !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.outputs.some((o) => o.outputCategory === selectedCategory));
  }
  if (selectedFunding !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.verticalFunded === (selectedFunding === 'vf'));
  }
  if (selectedVariousTaxonomy !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.flagship === selectedVariousTaxonomy || d.thematics.includes(selectedVariousTaxonomy)
      || (selectedVariousTaxonomy === 'allFlagships' && d.flagship));
  }
  if (selectedRegions !== 'all') {
    filteredProjectData = filteredProjectData.filter((d) => d.region === selectedRegions || d.incomeGroup === selectedRegions
    || d.hdiTier === selectedRegions || d.specialGroupings.includes(selectedRegions));
  }

  function calculateCountryTotals() {
    const groupedData = nest()
      .key((d: any) => d.countryName)
      .entries(filteredProjectData);
    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Country or Area'] === country.key)];
      const { region } = country.values[0];
      const numberOfProjects = country.values.length;
      const indTemp = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;
        let value;
        if (indicator.AggregationLevel === 'outputs') {
          value = sumBy(country.values, (project:any) => sumBy(project.outputs, (output:any) => {
            if (selectedCategory === 'all' || output.outputCategory === selectedCategory) {
              if (selectedSubCategory === 'all' || output.beneficiaryCategory === selectedSubCategory) {
                return output[indicatorName];
              }
              return 0;
            }
            return 0;
          }));
        } else {
          value = sumBy(country.values, (project:any) => project[indicatorName]);
        }
        return (
          {
            indicator: indicatorName,
            value,
          }
        );
      });
      indTemp[4].value = numberOfProjects;
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
  return (
    <>
      <div className='flex-div flex-wrap'>
        <div style={{ maxWidth: '75%', width: '100%' }}>
          <Settings />
          <MainText />
          <Cards
            data={mapData}
          />
          <div style={{ backgroundColor: 'var(--gray-200)' }}>
            <UnivariateMap
              data={mapData}
              indicators={indicators}
              projectCoordsData={projectCoordsData}
            />
          </div>
        </div>
        <div style={{ flex: '1 1', position: 'relative' }}>
          <DataTable projects={filteredProjectData} />
        </div>
      </div>
    </>
  );
};
