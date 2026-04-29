import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Tooltip } from 'antd';
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

const DisclaimerButton = styled.button`
  align-items: center;
  background: var(--white);
  border: 1px solid var(--gray-500);
  border-radius: 50%;
  color: var(--black);
  cursor: help;
  display: flex;
  font-size: 0.875rem;
  font-weight: 700;
  height: 1.75rem;
  justify-content: center;
  line-height: 1;
  position: absolute;
  right: 1rem;
  text-transform: none;
  top: 1rem;
  width: 1.75rem;
  z-index: 7;
  &:focus {
    outline: 2px solid #1f6fff;
    outline-offset: 2px;
  }
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
      <Tooltip
        title={t('map-disclaimer')}
        placement='left'
        overlayStyle={{ maxWidth: '24rem' }}
      >
        <DisclaimerButton
          aria-label={t('map-disclaimer')}
          type='button'
        >
          i
        </DisclaimerButton>
      </Tooltip>
      <Map
        data={data}
        geojsonMapData={geojsonMapData}
        availableCountryList={availableCountryList}
        binningRangeLarge={binningRangeLarge}
        indicators={indicators}
      />
    </El>
  );
};
