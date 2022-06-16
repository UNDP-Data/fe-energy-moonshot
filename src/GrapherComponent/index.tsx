import styled from 'styled-components';
import {
  DataType,
  IndicatorMetaDataType,
  ProjectCoordinateDataType,
} from '../Types';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { Graph } from './Graph';

interface Props {
  data: DataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
  regions: string[];
}

const Container = styled.div`
  max-width: 132rem;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const RootEl = styled.div`
  background-color: var(--white);
  color: var(--black-600);
  box-shadow: var(--shadow);
`;

const HeadingEl = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 0;
  align-items: center;
`;

const TitleEl = styled.div`
  display: flex;
  align-items: center;
`;

const GraphEl = styled.div`
  display: flex;
  align-items: stretch;
  @media (max-width: 960px) {
    display: inline;
  }  
`;

const H1 = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-blue);
  line-height: 2rem;
  margin: 1rem 0 0.5rem 1rem;
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;
const H2 = styled.div`
  font-size: 2rem;
  font-weight: bold;
  line-height: 2rem;
  margin: 0 0 0.5rem 1rem;
  @media (max-width: 600px) {
    font-size: 1.6rem;
  }
`;

const Note = styled.p`
  margin-top: 1em;
`;

export const GrapherComponent = (props: Props) => {
  const {
    data,
    projectCoordinatesData,
    indicators,
    regions,
  } = props;
  return (
    <>
      <Container>
        <HeadingEl>
          <TitleEl>
            <div>
              <H1>Energy-Related Projects</H1>
              <H2>Explore All Data (1991 - 2022)</H2>
            </div>
          </TitleEl>
        </HeadingEl>
        <Cards
          data={data}
        />
        <RootEl>
          <GraphEl>
            <Settings
              indicators={indicators}
              regions={regions}
            />
            <Graph
              data={data}
              projectCoordinatesData={projectCoordinatesData}
              indicators={indicators}
              fullWidth
            />
          </GraphEl>
        </RootEl>
        <Note>Note: this map presents data from PIMS+ and Transparency Portal</Note>
      </Container>
    </>
  );
};
