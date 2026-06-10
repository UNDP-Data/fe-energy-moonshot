import { useContext, useEffect, useMemo, useRef } from 'react';
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
  background-color: var(--black-100);
  display: flex;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  @media (max-width: 960px) {
    display: block;
    height: auto;
    min-height: 0;
  }
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
    outline: 2px solid var(--moonshot-dashboard-accent, #1f6fff);
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
    filters,
    xAxisIndicator,
    updateXAxisIndicator,
  } = useContext(Context) as CtxDataType;
  const { t } = useTranslation();
  const lastPreferredFilterSignatureRef = useRef('');
  const preferredFilterSignature = `${filters.category}|${filters.subCategory}`;
  const availableIndicators = useMemo(() => {
    const filteredIndicators = indicators.filter((indicator) => (
      data.some((country) => {
        const value = country.indicators.find((item) => item.indicator === indicator.DataKey);
        return typeof value?.value === 'number' && value.value > 0;
      })
    ));

    return filteredIndicators.length ? filteredIndicators : indicators;
  }, [data, indicators]);

  const preferredIndicator = useMemo(() => {
    const findAvailableIndicator = (dataKey: string) => (
      availableIndicators.find((indicator) => indicator.DataKey === dataKey)
    );

    if (filters.category === 'Policy' || filters.subCategory.startsWith('Policy')) {
      return findAvailableIndicator('policies');
    }

    if (filters.category === 'Energy Transition') {
      return findAvailableIndicator('mwAdded');
    }

    if (filters.category === 'Energy Access' || filters.category === 'Productive Use') {
      return findAvailableIndicator('directBeneficiaries');
    }

    return undefined;
  }, [availableIndicators, filters.category, filters.subCategory]);

  const options = useMemo(
    () => availableIndicators.map((d) => d.Indicator),
    [availableIndicators],
  );

  useEffect(() => {
    if (!options.length) return;

    const preferredFilterChanged = lastPreferredFilterSignatureRef.current !== preferredFilterSignature;
    lastPreferredFilterSignatureRef.current = preferredFilterSignature;

    if (
      preferredFilterChanged
      &&
      preferredIndicator
      && xAxisIndicator !== preferredIndicator.Indicator
    ) {
      updateXAxisIndicator(preferredIndicator.Indicator);
      return;
    }

    if (!options.includes(xAxisIndicator)) {
      updateXAxisIndicator(options[0]);
    }
  }, [
    options,
    preferredFilterSignature,
    preferredIndicator,
    updateXAxisIndicator,
    xAxisIndicator,
  ]);

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
        indicators={availableIndicators}
      />
    </El>
  );
};
