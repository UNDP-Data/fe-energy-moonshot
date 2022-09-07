import styled from 'styled-components';
import { useContext } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CtxDataType,
  ProjectDataType,
  IndicatorMetaDataType,
  ProjectCoordinateDataType,
  RegionDataType,
} from '../Types';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { Graph } from './Graph';

interface Props {
  data: ProjectDataType[];
  countryGroupData: CountryGroupDataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
  regions: RegionDataType[];
}

const Container = styled.div`
  max-width: 132rem;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const RootEl = styled.div`
  background-color: var(--white);
  color: var(--black-600);
`;

const HeadingEl = styled.div`
  padding: 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const H1 = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-blue);
  margin: 0 0 0.75rem 0;
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;
const H2 = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 2.4rem;
  @media (max-width: 600px) {
    font-size: 1.6rem;
  }
`;

const Note = styled.p`
  margin-top: 2rem;
  font-size: 1.4rem;
  line-height: 1.8rem;
  color: var(--black-500);
  font-style: italic;
`;

const regionList = [
  { value: 'RBA', label: 'Regional Bureau for Africa (RBA)' },
  { value: 'RBAP', label: 'Regional Bureau for Asia and the Pacific (RBAP)' },
  { value: 'RBAS', label: 'Regional Bureau for Arab States (RBAS)' },
  { value: 'RBEC', label: 'Regional Bureau for Europe and the Commonwealth of Independent States (RBEC)' },
  { value: 'RBLAC', label: 'Regional Bureau on Latin America and the Caribbean (RBLAC)' },
];

export const GrapherComponent = (props: Props) => {
  const {
    data,
    countryGroupData,
    projectCoordinatesData,
    indicators,
    regions,
  } = props;
  const {
    selectedTaxonomy,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');
  const filteredProjectData = data.filter((d) => selectedTaxonomy === 'All' || d.taxonomy === selectedTaxonomy);
  function calculateCountryTotals() {
    const groupedData = nest()
      .key((d: any) => d['Lead Country'])
      .entries(filteredProjectData);

    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Country or Area'] === country.key)];
      const region = country.values[0].Region;
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
      indTemp.push({ indicator: 'tree_equivalent', value: sumBy(country.values, (project: any) => project.tree_equivalent) });
      indTemp.push({ indicator: 'car_equivalent', value: sumBy(country.values, (project: any) => project.car_equivalent) });
      return ({
        ...countryGroup,
        region,
        indicatorsAvailable: indTemp.map((ind) => ind.indicator),
        indicators: indTemp,
      });
    });
    return (countryData);
  }
  const mapData = calculateCountryTotals();
  return (
    <>
      <Container>
        <HeadingEl>
          <div>
            <div>
              <H1>Energy-Related Portfolio</H1>
              <H2>
                Explore Data from Active Projects
                {queryRegion ? ` for ${regionList[regionList.findIndex((d) => d.value === queryRegion)].label}` : null}
              </H2>
            </div>
          </div>
        </HeadingEl>
        <Settings
          regions={regions}
        />
        <RootEl>
          <Cards
            data={mapData}
          />
          <Graph
            data={mapData}
            projectCoordinatesData={projectCoordinatesData}
            indicators={indicators}
          />
        </RootEl>
        <Note>
          Note: this map presents data on active projects from PIMS+. Active projects are defined as being in the approved/endorsed, hard pipeline, or under implementation stages or have a status of &lsquo;implementation.&rsquo; Calculations of equivalent tree seedlings grown and passenger cars taken off the road are from
          {' '}
          <a target='_black' href='https://sunroof.withgoogle.com/building/37.476876/-122.253535/#?f=buy'>here</a>
          .
        </Note>
      </Container>
    </>
  );
};
