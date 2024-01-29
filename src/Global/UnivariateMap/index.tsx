import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import Context from '../../Context/Context';
import {
  CtxDataType, DataType, IndicatorMetaDataType, IndicatorRange,
} from '../../Types';
import { Map } from './Map';

interface Props {
  data: DataType[];
  indicators: IndicatorMetaDataType[];
  binningRangeLarge: IndicatorRange;
}

const El = styled.div`
  width: 100%;
  overflow: auto;
  position: relative;
  background-color: var(--black-100);
`;

export const UnivariateMap = (props: Props) => {
  const {
    data,
    binningRangeLarge,
    indicators,
  } = props;

  const {
    xAxisIndicator,
    updateXAxisIndicator,
  } = useContext(Context) as CtxDataType;
  const options = indicators.map((d) => d.Indicator);

  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [options]);

  return (
    <El id='graph-node'>
      <Map
        data={data}
        binningRangeLarge={binningRangeLarge}
        indicators={indicators}
      />
    </El>
  );
};
