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
  height: 191px;
`;

const MetricNumber = styled.span`
  font-weight: bold;
  font-size: 2em;
  line-height: 1.5em;
  margin-right: 10px;
`;

const MetricShare = styled.div`
  margin-bottom: 0.5em;
  margin-top: -0.5em;
  font-size: 1.4rem;
`;

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

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(2))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions.length > 0
      ? data.filter((d) => d['Group 2'] === selectedRegions) : data;
  const selectedGeography = selectedCountries.length > 0 ? selectedCountries : selectedRegions.length > 0 ? selectedRegions : 'Global';
  const cardMetrics = [
    { metriclabel: 'People directly benefiting', metricName: 'People directly benefiting' },
    { metriclabel: 'Emissions reduced (tonnes)', metricName: 'Tonnes of CO2 emissions reduced' },
    { metriclabel: 'Renewable energy capacity installed (MW)', metricName: 'MW of renewable energy capacity installed' },
    { metriclabel: 'Total grant amount (USD)', metricName: 'Grant Amount' },
  ];

  const cardData = cardMetrics.map((m) => ({
    metricLabel: m.metriclabel,
    metricValue: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === m.metricName)[0].value),
    globalTotal: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === m.metricName)[0].value),
  }));

  cardData.push({
    metricLabel: 'Number of countries',
    metricValue: relevantData.length,
    globalTotal: data.length,
  });

  return (
    <Wrapper>
      {
        cardData.map((d) => (
          <Card>
            <h4>
              {d.metricLabel}
              :
            </h4>
            <MetricNumber>{d.metricValue === undefined ? 'N/A' : formatData(d.metricValue)}</MetricNumber>
            <MetricShare>
              {
                selectedGeography !== 'Global' && d.metricValue !== undefined && d.metricLabel !== 'Number of countries'
                  ? `(${format('.1%')(d.metricValue / d.globalTotal)} of total portfolio)`
                  : null
              }
            </MetricShare>
            <div>
              { selectedGeography }
            </div>
          </Card>
        ))
      }
    </Wrapper>
  );
};
