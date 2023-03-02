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

interface Props {
  countryGroupData: CountryGroupDataType[];
  indicators: IndicatorMetaDataType[];
  regions: RegionDataType[];
  projectLevelData: ProjectLevelDataType[],
  projectCoordsData: ProjectCoordsDataType[],
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
    // eslint-disable-next-line no-console
    // console.log('in groupedData', countryData);
    return (countryData);
  }
  const mapData = calculateCountryTotals();
  return (
    <>
      {queryRegion ? ` for ${regionList[regionList.findIndex((d) => d.value === queryRegion)].label}` : null}
      <div className='margin-bottom-05'><p className='undp-typography'>UNDP and partners are currently supporting energy projects in XX countries, which translates into approximately USD XXX  million in financial resources mobilized from the development community and national governments. These interventions can provide clean and affordable energy to more than XX million people worldwide. More than XXXX of the XXXX active energy-related projects supported by UNDP and partners are implemented in Sub-Saharan Africa, which amounts to more than USD XX million and can help 13.2 million people in the region to gain access to electricity and clean cooking solutions. Through the promotion of renewable energy, these interventions are showcasing alternative development pathways away from traditional fossil-fuel based solutions and are thus contributing to the energy transition.</p></div>
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
