import { useContext } from 'react';
import styled from 'styled-components';
import sumBy from 'lodash.sumby';
import { format } from 'd3-format';
import {
  CtxDataType, DataType,
} from '../Types';
import Context from '../Context/Context';

interface Props {
  data: DataType[];
}

const Wrapper = styled.div`
    display: flex;
    gap: 1%;
    margin-bottom: 1em;
`;

const Card = styled.div`
  flex: 1;
  padding: 1em;
  background-color: rgb(242, 247, 255);
  border-radius: 10px;
`;

const MetricNumber = styled.span`
  font-weight: bold;
  font-size: 2em;
  line-height: 1.1em;
  margin-right: 10px;
`;

// const MetricShare = styled.div`
//   margin-bottom: 0.5em;
//   margin-top: -0.5em;
//   font-size: 1.4rem;
// `;

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

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions.length > 0
      ? data.filter((d) => d['Group 2'] === selectedRegions) : data;
  const selectedGeography = selectedCountries.length > 0 ? selectedCountries : selectedRegions.length > 0 ? selectedRegions : 'Global';

  // const cardMetrics = [
  //   { metriclabel: 'People directly benefiting', metricName: 'People directly benefiting' },
  //   { metriclabel: 'Emissions reduced (tonnes)', metricName: 'Tonnes of CO2 emissions reduced' },
  //   { metriclabel: 'Renewable energy capacity installed (MW)', metricName: 'MW of renewable energy capacity installed' },
  //   { metriclabel: 'Total grant amount (USD)', metricName: 'Grant Amount' },
  // ];

  // const cardData = cardMetrics.map((m) => ({
  //   metricLabel: m.metriclabel,
  //   metricValue: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === m.metricName)[0].value),
  //   globalTotal: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === m.metricName)[0].value),
  // }));

  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'People directly benefiting')[0].value),
    emissionsReduced: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tree_equivalent')[0].value),
    // renewableEnergyInstalled: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'MW of renewable energy capacity installed')[0].value),
    grantAmountVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_vertical_fund')[0].value),
    grantAmountNonVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_nonvertical_fund')[0].value),
    numberCountries: relevantData.length,
  };

  return (
    <Wrapper>
      <Card>
        <h4>People directly benefiting</h4>
        <MetricNumber>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</MetricNumber>
        <div>
          { selectedGeography }
        </div>
      </Card>
      <Card>
        <h4>Emissions reduced equivalent to</h4>
        <MetricNumber>
          {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced)}
          {' '}
          trees per year
        </MetricNumber>
        <div>
          { selectedGeography }
        </div>
      </Card>
      <Card>
        <h4>Total grant amount (USD)</h4>
        <div style={{ display: 'flex' }}>
          <div>
            Vertical Fund:
            {' '}
            <MetricNumber>{cardData.grantAmountVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountVerticalFunds)}</MetricNumber>
          </div>
          <div>
            Non-vertical fund:
            {' '}
            <MetricNumber>{cardData.grantAmountNonVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountNonVerticalFunds)}</MetricNumber>
          </div>
        </div>
        <div>
          { selectedGeography }
        </div>
      </Card>
      <Card>
        <h4>Number of countries</h4>
        <MetricNumber>{cardData.numberCountries === undefined ? 'N/A' : formatData(cardData.numberCountries)}</MetricNumber>
        <div>
          { selectedGeography }
        </div>
      </Card>
    </Wrapper>
  );
};
