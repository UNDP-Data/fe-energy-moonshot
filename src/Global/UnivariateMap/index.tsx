import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const options = useMemo(() => indicators.map((d) => d.Indicator), [indicators]);

  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [options, updateXAxisIndicator, xAxisIndicator]);

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
        {t('map-disclaimer')}
      </div>
    </El>
  );
};
