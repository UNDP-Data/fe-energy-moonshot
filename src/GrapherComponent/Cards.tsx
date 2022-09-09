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
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Card = styled.div`
  width: calc(25% - 2rem);
  background-color: var(--black-100);
  padding: 4.8rem;
  font-size: 1.8rem;
  line-height: 2.4rem;
  margin-bottom: 2rem;
  cursor: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA4MiAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xMiAxTDIgOS45OTc4MU0yIDkuOTk3ODFMMTIgMTlNMiA5Ljk5NzgxTDgxLjUgOS45OTc4MSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+DQo8L3N2Zz4NCg==), auto;
  &:hover {
    background-color: var(--yellow);
    div {
      color: var(--black-700);
    }
  }
  @media (max-width: 1280px) {
    width: calc(50% - 1rem);
  } 
  @media (max-width: 620px) {
    width: 100%;
  }  
`;

const FullWidthCard = styled.div`
  width: 100%;
  background-color: var(--black-100);
  padding: 4.8rem;
  font-size: 2rem;
  line-height: 2.4rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  cursor: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA4MiAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xMiAxTDIgOS45OTc4MU0yIDkuOTk3ODFMMTIgMTlNMiA5Ljk5NzgxTDgxLjUgOS45OTc4MSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIi8+DQo8L3N2Zz4NCg==), auto;
  &:hover {
    background-color: var(--yellow);
    div {
      color: var(--black-700);
    }
  }
`;

const MetricNumber = styled.div`
  font-size: 6.4rem;
  line-height: 1.09;
  margin-bottom: 1rem;
  -webkit-text-stroke: 2px var(--black-700);
  text-stroke: 2px var(--black-700);
  font-weight: 700;
  text-shadow: none;
  color: var(--black-100);
  @media (max-width: 1024px) {
    text-align: center;
  }  
`;

const MetricNumberLong = styled.div`
  font-size: 6.4rem;
  line-height: 1.09;
  margin-bottom: 1rem;
  -webkit-text-stroke: 2px var(--black-700);
  text-stroke: 2px var(--black-700);
  font-weight: 700;
  text-shadow: none;
  color: var(--black-100);
  @media (max-width: 1024px) {
    text-align: center;
  }  
`;

const MetricTitle = styled.h4`
  font-size: 1.4rem;
  line-height: 2.4rem;
  margin-bottom: 3rem;
  text-transform: uppercase;
  font-weight: 700;
`;

const MetricAnnotation = styled.span`
  font-size: 1.8rem;
  line-height: 2.4rem;
`;

const EmissionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 1024px) {
    flex-direction: column;
  }  
`;

const MetricDiv = styled.div`
  width: fit-content;
  max-width: 30%;
  @media (max-width: 1024px) {
    max-width: 100%;
  }  
`;

const EqualSignDiv = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  text-transform: uppercase;
  margin: 1rem 0;
  width: fit-content;
  @media (max-width: 1024px) {
    margin: 4rem 0;
  }
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

    if (d < 10000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };

  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions !== 'All'
      ? data.filter((d) => d.region === selectedRegions) : data;
  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'people directly benefiting')[0].value),
    emissionsReduced: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tonnes of CO2-eq emissions avoided or reduced')[0].value),
    treeEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tree_equivalent')[0].value),
    carsEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'car_equivalent')[0].value),
    grantAmountVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_vertical_fund')[0].value),
    numberCountries: relevantData.length,
    numberProjects: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Number of projects')[0].value),
  };

  return (
    <>

      <Wrapper>
        <Card>
          <MetricNumber>{formatData(cardData.numberCountries)}</MetricNumber>
          <div>Number of countries</div>
        </Card>
        <Card>
          <MetricNumber>{cardData.numberProjects === undefined ? 'N/A' : formatData(cardData.numberProjects)}</MetricNumber>
          <div>Number of projects</div>
        </Card>
        <Card>
          <MetricNumber>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</MetricNumber>
          <div>People directly benefiting (achieved + expected)</div>
        </Card>
        <Card>
          <MetricNumber>{cardData.grantAmountVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountVerticalFunds)}</MetricNumber>
          <div>Total grant amount (USD)</div>
        </Card>
      </Wrapper>
      <FullWidthCard>
        <MetricTitle>Estimated Environmental Impact (achieved + expected)</MetricTitle>
        <EmissionsWrapper>
          <MetricDiv>
            <MetricNumberLong>
              {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced)}
            </MetricNumberLong>
            <MetricAnnotation>metric tons of CO2 Reduced</MetricAnnotation>
          </MetricDiv>
          <EqualSignDiv>same as</EqualSignDiv>
          <MetricDiv>
            <MetricNumberLong>
              {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced * 0.21739)}
            </MetricNumberLong>
            <MetricAnnotation>cars taken off the road for an year**</MetricAnnotation>
          </MetricDiv>
          <EqualSignDiv>or</EqualSignDiv>
          <MetricDiv>
            <MetricNumberLong>
              {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced * 5.0105)}
            </MetricNumberLong>
            <MetricAnnotation>tree seedling grown for 20 years***</MetricAnnotation>
          </MetricDiv>
        </EmissionsWrapper>
      </FullWidthCard>
    </>
  );
};
