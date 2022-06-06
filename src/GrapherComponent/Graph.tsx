import styled from 'styled-components';
import { DataType, IndicatorMetaDataType, ProjectCoordinateDataType } from '../Types';
import { UnivariateMap } from './UnivariateMap';

interface Props {
  data: DataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
  fullWidth: boolean;
}

interface ElProps {
  fullWidth: boolean;
}

const El = styled.div<ElProps>`
  width: ${(props) => (props.fullWidth ? '100%' : '75%')};
  box-shadow: var(--shadow-right);
  overflow: auto;
  @media (min-width: 961px) {
    height: 74rem;
  }
  @media (max-width: 960px) {
    width: 100%;
  }
`;

export const Graph = (props: Props) => {
  const {
    data,
    projectCoordinatesData,
    indicators,
    fullWidth,
  } = props;

  return (
    <El id='graph-node' fullWidth={fullWidth}>
      <UnivariateMap
        data={data}
        projectCoordinatesData={projectCoordinatesData}
        indicators={indicators}
      />
    </El>
  );
};
