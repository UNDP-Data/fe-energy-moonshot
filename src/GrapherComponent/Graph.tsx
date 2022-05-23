import styled from 'styled-components';
import { DataType, IndicatorMetaDataType } from '../Types';
import { Cards } from './Cards';
import { UnivariateMap } from './UnivariateMap';

interface Props {
  data: DataType[];
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
    indicators,
    fullWidth,
  } = props;

  return (
    <El id='graph-node' fullWidth={fullWidth}>
      <Cards
        data={data}
      />
      <UnivariateMap
        data={data}
        indicators={indicators}
      />
    </El>
  );
};
