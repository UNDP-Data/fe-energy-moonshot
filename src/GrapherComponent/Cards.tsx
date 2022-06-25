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
import { DonutChartCard } from '../Components/DonutChart';

interface Props {
  data: DataType[];
}

const Wrapper = styled.div`
  width: 27%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  border-right: 1px solid var(--black-400);
  max-height: 74rem;
  overflow-y: auto;
`;

const Card = styled.div`
  border-bottom: 1px solid var(--black-400);
  padding: 1.6rem 1rem;
`;

const CountryNoEl = styled.span`
  font-size: 1.6rem;
  line-height: 2.4rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-weight: 700;
`;

const MetricTitle = styled.h4`
  font-size: 1.4rem;
  line-height: 2.4rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-weight: 700;
`;

const MetricNumber = styled.div`
  font-weight: bold;
  font-size: 2.4rem;
  line-height: 1.6rem;
  padding: 1rem 0 0.5rem 0;
`;

const MetricAnnotation = styled.span`
  font-size: 1.4rem;
  font-style: italic;
  font-weight: normal;
`;

const MetricLocation = styled.div`
  font-size: 2.4rem;
  line-height: 3.2rem;
  font-weight: 700;
  padding: 1.6rem 1rem;
  border-bottom: 1px solid var(--black-500);
`;

const EmissionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-evenly; */
  /* align-items: end; */
`;

const IconWrapper = styled.div`
`;

const EqualSignDiv = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  margin: 1rem 0 1rem 0;
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
      ? data.filter((d) => d.region === selectedRegions) : data;
  const selectedGeography = selectedCountries.length > 0 ? selectedCountries : selectedRegions.length > 0 ? selectedRegions : 'Global';

  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'People directly benefiting')[0].value),
    emissionsReduced: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Tonnes of CO2 emissions reduced')[0].value),
    treeEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'tree_equivalent')[0].value),
    carsEquivalent: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'car_equivalent')[0].value),
    grantAmountVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_vertical_fund')[0].value),
    grantAmountNonVerticalFunds: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'grant_amount_nonvertical_fund')[0].value),
    numberCountries: relevantData.length,
  };

  return (
    <>
      <Wrapper>
        <MetricLocation>
          { selectedGeography }
          {
            (!selectedCountries || selectedCountries.length === 0)
            && (
            <CountryNoEl>
              {' '}
              (
              {cardData.numberCountries}
              {' '}
              Countries)
            </CountryNoEl>
            )
          }
        </MetricLocation>
        <Card>
          <MetricTitle>People directly benefiting</MetricTitle>
          <MetricNumber>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</MetricNumber>
        </Card>
        <Card>
          <MetricTitle>Total grant amount (USD)</MetricTitle>
          {
            cardData.grantAmountVerticalFunds || cardData.grantAmountNonVerticalFunds
              ? (
                <DonutChartCard
                  vertFund={cardData.grantAmountVerticalFunds}
                  nonVertFund={cardData.grantAmountNonVerticalFunds}
                />
              )
              : (
                <div style={{ flex: 1 }}>
                  <MetricNumber>N/A</MetricNumber>
                </div>
              )
          }
        </Card>
        <Card>
          <MetricTitle>Estimated Environmental Impact</MetricTitle>
          <EmissionsWrapper>
            <MetricNumber>
              {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced)}
            </MetricNumber>
            <MetricAnnotation>metric tons of CO2 Reduced</MetricAnnotation>
            <EqualSignDiv>same as</EqualSignDiv>
            <IconWrapper>
              <TreeIcon size={25} fill='rgb(33, 33, 33)' />
              <MetricNumber>
                {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.treeEquivalent)}
                {' '}
                <MetricAnnotation>tree seedlings grown for 10 years</MetricAnnotation>
              </MetricNumber>
            </IconWrapper>
            <EqualSignDiv>or</EqualSignDiv>
            <IconWrapper>
              <CarIcon size={40} fill='rgb(33, 33, 33)' />
              <MetricNumber>
                {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.carsEquivalent)}
                {' '}
                <MetricAnnotation>cars taken off the road for an year</MetricAnnotation>
              </MetricNumber>
            </IconWrapper>
          </EmissionsWrapper>
        </Card>
      </Wrapper>
    </>
  );
};
