import { useContext } from 'react';
// import styled from 'styled-components';
import sumBy from 'lodash.sumby';
import { format } from 'd3-format';
import {
  CtxDataType, DataType,
} from '../Types';
import Context from '../Context/Context';

interface Props {
  data: DataType[];
}

export const Cards = (props: Props) => {
  const {
    data,
  } = props;
  const {
    selectedCountries,
    selectedRegions,
  } = useContext(Context) as CtxDataType;
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 10000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };

  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions !== 'All'
      ? data.filter((d) => d.region === selectedRegions) : data;
  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'target_total')[0].value),
    // emissionsReduced: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tonnes of CO2-eq emissions avoided or reduced')[0].value),
    // treeEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tree_equivalent')[0].value),
    // carsEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'car_equivalent')[0].value),
    grantAmountVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Grant amount')[0].value),
    numberCountries: relevantData.length,
    // numberProjects: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Number of projects')[0].value),
  };

  return (
    <>
      <div className='stat-container flex-div margin-bottom-05'>
        <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
          <h3>{formatData(cardData.numberCountries)}</h3>
          <p>Number of countries</p>
        </div>
        <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
          <h3>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h3>
          <p>People directly benefiting (achieved + expected)</p>
        </div>
        <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
          <h3>{cardData.grantAmountVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountVerticalFunds)}</h3>
          <p>Total grant amount (USD)</p>
        </div>
      </div>
    </>
  );
};
