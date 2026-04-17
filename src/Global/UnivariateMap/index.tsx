import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import Context from '../../Context/Context';
import {
  CtxDataType, DataType, IndicatorMetaDataType, IndicatorRange,
} from '../../Types';
import { Map } from './Map';

interface Props {
  data: DataType[];
  geojsonMapData: any[];
  indicators: IndicatorMetaDataType[];
  availableCountryList: string[];
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
    geojsonMapData,
    availableCountryList,
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
        geojsonMapData={geojsonMapData}
        availableCountryList={availableCountryList}
        binningRangeLarge={binningRangeLarge}
        indicators={indicators}
      />
      <div
        style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#666',
          fontStyle: 'italic',
          padding: '0 1rem',
        }}
      >
        The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.
      </div>
    </El>
  );
};
