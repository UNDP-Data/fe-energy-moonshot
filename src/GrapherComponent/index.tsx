import { useContext } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CtxDataType,
  IndicatorMetaDataType,
  RegionDataType,
  ProjectLevelDataType,
  ProjectCoordsDataType,
} from '../Types';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { Graph } from './Graph';
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
interface Props {
  countryGroupData: CountryGroupDataType[];
  indicators: IndicatorMetaDataType[];
  regions: RegionDataType[];
  countries: string[];
  projectLevelData: ProjectLevelDataType[];
  projectCoordsData: ProjectCoordsDataType[];
}

const regionList = [
  { value: 'RBA', label: 'Regional Bureau for Africa (RBA)' },
  { value: 'RBAP', label: 'Regional Bureau for Asia and the Pacific (RBAP)' },
  { value: 'RBAS', label: 'Regional Bureau for Arab States (RBAS)' },
  { value: 'RBEC', label: 'Regional Bureau for Europe and the Commonwealth of Independent States (RBEC)' },
  { value: 'RBLAC', label: 'Regional Bureau on Latin America and the Caribbean (RBLAC)' },
];

export const GrapherComponent = (props: Props) => {
  const {
    countryGroupData,
    indicators,
    regions,
    countries,
    projectLevelData,
    projectCoordsData,
  } = props;
  const {
    selectedTaxonomy,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');
  const filteredProjectData = projectLevelData.filter((d) => selectedTaxonomy === 'All' || d.taxonomy_level3 === selectedTaxonomy);
  function calculateCountryTotals() {
    const groupedData = nest()
      .key((d: any) => d['Lead Country'])
      .entries(filteredProjectData);

    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Country or Area'] === country.key)];
      const region = country.values[0]['Regional Bureau'];
      const numberOfProjects = country.values.length;
      const indTemp = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;
        const value = sumBy(country.values, (project:any) => project[indicatorName]);
        return (
          {
            indicator: indicatorName,
            value,
          }
        );
      });
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
  const rbaPercentProjects = sumBy(mapData.filter((d) => d.region === 'RBA'), (project:any) => project.numberProjects) / projectLevelData.length;
  const rbaTotalGrant = sumBy(mapData.filter((d) => d.region === 'RBA'), (project:any) => project.indicators.filter((ind:any) => ind.indicator === 'Grant amount')[0].value);
  const rbaTargetTotal = sumBy(mapData.filter((d) => d.region === 'RBA'), (project:any) => project.indicators.filter((ind:any) => ind.indicator === 'target_total')[0].value);
  console.log('mapData', mapData);
  return (
    <>
      {queryRegion ? ` for ${regionList[regionList.findIndex((d) => d.value === queryRegion)].label}` : null}
      <div className='margin-bottom-05'>
        <p className='undp-typography'>{`UNDP and partners are currently supporting energy projects in ${countries.length} countries, which translates into approximately USD ${Math.round(sumBy(projectLevelData, (project:any) => project['Grant amount']) / 1000000)} million in financial resources mobilized from the development community and national governments. These interventions can provide clean and affordable energy to more than ${Math.round(sumBy(projectLevelData, (project:any) => project.target_total) / 1000000)} million people worldwide. More than ${Math.round(rbaPercentProjects * 100)}% of the ${projectLevelData.length} active energy-related projects supported by UNDP and partners are implemented in Sub-Saharan Africa, which amounts to more than USD ${Math.round(rbaTotalGrant / 1000000)} million and can help ${Math.round(rbaTargetTotal / 1000000)} million people in the region to gain access to electricity and clean cooking solutions. Through the promotion of renewable energy, these interventions are showcasing alternative development pathways away from traditional fossil-fuel based solutions and are thus contributing to the energy transition.`}</p>
        <i className='small-font'>Note: The values within the text are dynamically calculated according to the data available at the moment. New values will appear once the SEH team data is being used.</i>
      </div>
      <Settings
        regions={regions}
      />
      <Cards
        data={mapData}
      />
      <div style={{ backgroundColor: 'var(--gray-200)' }}>
        <Graph
          data={mapData}
          indicators={indicators}
          projectCoordsData={projectCoordsData}
        />
      </div>
    </>
  );
};
