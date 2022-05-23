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
    margin: 0 1em;
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
  line-height: 1.5em;
`;

export const Cards = (props: Props) => {
  const {
    data,
  } = props;
  const {
    selectedCountries,
    selectedRegions,
  } = useContext(Context) as CtxDataType;

  const relevantData = selectedCountries ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions ? data.filter((d) => d['Group 2'] === selectedRegions)
      : data;
  const cardData = {
    geography: selectedCountries || selectedRegions || 'Global',
    'Number of people benefiting': sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Number of people impacted')[0].value),
    'Emissions reduced': sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Tonnes of CO2 emissions reduced')[0].value),
    'Total spending': sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Grant Amount')[0].value),
  };
  return (
    <Wrapper>
      <Card>
        Number of people benefiting:
        <br />
        <MetricNumber>{ format(',')(cardData['Number of people benefiting']) }</MetricNumber>
        <br />
        { cardData.geography }
      </Card>
      <Card>
        Emissions reduced:
        <br />
        <MetricNumber>{ format(',.0f')(cardData['Emissions reduced']) }</MetricNumber>
        <br />
        { cardData.geography }
      </Card>
      <Card>
        Total spending:
        <br />
        <MetricNumber>{ format(',')(cardData['Total spending']) }</MetricNumber>
        <br />
        { cardData.geography }
      </Card>
    </Wrapper>
  );
};
