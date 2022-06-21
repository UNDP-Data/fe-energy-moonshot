import { useContext } from 'react';
import styled from 'styled-components';
import sumBy from 'lodash.sumby';
import { format } from 'd3-format';
import {
  CtxDataType, DataType,
} from '../Types';
import {
  CarIcon, TreeIcon,
} from '../Icons';
import Context from '../Context/Context';

interface Props {
  data: DataType[];
}

const Wrapper = styled.div`
  width: 27%;
  padding: 1em 2em;
  display: flex;
  gap: 2.5em;
  flex-direction: column;
  justify-content: start;
  border-right: 1px solid var(--black-400);
`;

const Card = styled.div`
  /* flex: 1; */
`;

const MetricTitle = styled.h4`
  font-size: 1.4rem;
  line-height: 1.5;
  font-weight: 400;
`;

const MetricNumber = styled.div`
  font-weight: bold;
  font-size: 1.5em;
  line-height: 1.1em;
`;

const MetricAnnotation = styled.div`
  font-size: 1.3rem;
  line-height: 1.5;
`;

const MetricLocation = styled.div`
  line-height: 1.4;
  font-weight: 700;
`;

const EmissionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-evenly; */
  /* align-items: end; */
`;

const EmissionsItem = styled.div`
  flex: 1;
`;

const IconWrapper = styled.div`
`;

const EqualSignDiv = styled.div`
  font-size: 1.4rem;
  font-style: italic;
  margin: 0.8em 0 0.5em;
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

    if (d < 1000000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions.length > 0
      ? data.filter((d) => d['Group 2'] === selectedRegions) : data;
  const selectedGeography = selectedCountries.length > 0 ? selectedCountries : selectedRegions.length > 0 ? selectedRegions : 'Global';

  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'People directly benefiting')[0].value),
    emissionsReduced: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Tonnes of CO2 emissions reduced')[0].value),
    treeEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tree_equivalent')[0].value),
    carsEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'car_equivalent')[0].value),
    // renewableEnergyInstalled: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'MW of renewable energy capacity installed')[0].value),
    grantAmountVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_vertical_fund')[0].value),
    grantAmountNonVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_nonvertical_fund')[0].value),
    numberCountries: relevantData.length,
  };

  return (
    <>
      <Wrapper>
        <MetricLocation>
          { selectedGeography }
        </MetricLocation>
        <Card>
          <MetricTitle>People directly benefiting:</MetricTitle>
          <MetricNumber>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</MetricNumber>
        </Card>
        <Card>
          <MetricTitle>Total grant amount (USD):</MetricTitle>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <MetricNumber>{cardData.grantAmountVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountVerticalFunds)}</MetricNumber>
              <MetricAnnotation>Vertical Fund</MetricAnnotation>
            </div>
            <div style={{ flex: 1 }}>
              <MetricNumber>{cardData.grantAmountNonVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountNonVerticalFunds)}</MetricNumber>
              <MetricAnnotation>Non-vertical fund</MetricAnnotation>
            </div>
          </div>
        </Card>
        <Card>
          <MetricTitle>Emissions reduced</MetricTitle>
          <EmissionsWrapper>
            <EmissionsItem>
              <MetricNumber>
                {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced)}
              </MetricNumber>
              <MetricAnnotation>metric tons of Carbon Dioxide</MetricAnnotation>
            </EmissionsItem>
            <EqualSignDiv>equivalent to</EqualSignDiv>
            <div style={{ display: 'flex', gap: '5%', alignItems: 'baseline' }}>
              <EmissionsItem>
                <IconWrapper>
                  <TreeIcon size={20} fill='rgb(33, 33, 33)' />
                  <MetricNumber>
                    {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.treeEquivalent)}
                  </MetricNumber>
                </IconWrapper>
                <MetricAnnotation>tree seedlings grown for 10 years</MetricAnnotation>
              </EmissionsItem>
              <EmissionsItem>
                <IconWrapper>
                  <CarIcon size={40} fill='rgb(33, 33, 33)' />
                  <MetricNumber>
                    {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.carsEquivalent)}
                  </MetricNumber>
                </IconWrapper>
                <MetricAnnotation>passenger cars taken off the road for 1 year</MetricAnnotation>
              </EmissionsItem>
            </div>
          </EmissionsWrapper>
        </Card>
        {
          (!selectedCountries || selectedCountries.length === 0)
          && (
            <Card>
              <MetricTitle>Number of countries:</MetricTitle>
              <MetricNumber>{cardData.numberCountries === undefined ? 'N/A' : formatData(cardData.numberCountries)}</MetricNumber>
            </Card>
          )
        }
      </Wrapper>
    </>
  );
};
