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
    display: flex;
    gap: 1%;
    margin-bottom: 1em;
    flex-wrap: wrap;
`;

const Card = styled.div`
  flex: 1;
  padding: 1em;
  background-color: rgb(242, 247, 255);
  border-radius: 10px;
  text-align: center;
`;

const MetricTitle = styled.h4`
  text-transform: uppercase;
  font-size: 1.4rem;
`;

const MetricNumber = styled.div`
  font-weight: bold;
  font-size: 2em;
  line-height: 1.1em;
`;

const MetricAnnotation = styled.div`
  font-size: 1.3rem;
`;

const MetricLocation = styled.div`
  margin-top: 1rem;
`;

const EmissionsWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: baseline;
  padding-left: 100px;
`;

const EmissionsItem = styled.div`
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-evenly;
  margin-left: 32px;
  margin-right: 32px;
`;

const EqualSignDiv = styled.div`
  font-size: 2.4rem;
  font-weight: bold;
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
        <Card>
          <MetricTitle>People directly benefiting</MetricTitle>
          <div style={{ height: 20 }}>
            {' '}
          </div>
          <MetricNumber>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</MetricNumber>
          <MetricLocation>
            { selectedGeography }
          </MetricLocation>
        </Card>
        <Card>
          <MetricTitle>Total grant amount (USD)</MetricTitle>
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <div>
              <MetricAnnotation>Vertical Fund:</MetricAnnotation>
              <MetricNumber>{cardData.grantAmountVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountVerticalFunds)}</MetricNumber>
            </div>
            <div>
              <MetricAnnotation>Non-vertical fund:</MetricAnnotation>
              <MetricNumber>{cardData.grantAmountNonVerticalFunds === undefined ? 'N/A' : formatData(cardData.grantAmountNonVerticalFunds)}</MetricNumber>
            </div>
          </div>
          <MetricLocation>
            { selectedGeography }
          </MetricLocation>
        </Card>
        <Card>
          <MetricTitle>Number of countries</MetricTitle>
          <div style={{ height: 20 }}>
            {' '}
          </div>
          <MetricNumber>{cardData.numberCountries === undefined ? 'N/A' : formatData(cardData.numberCountries)}</MetricNumber>
          <MetricLocation>
            { selectedGeography }
          </MetricLocation>
        </Card>
      </Wrapper>
      <Wrapper>
        <Card>
          <MetricTitle>Emissions reduced</MetricTitle>
          <EmissionsWrapper>
            <EmissionsItem>
              <MetricNumber>
                {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.emissionsReduced)}
              </MetricNumber>
              <MetricAnnotation>metric tons of Carbon Dioxide</MetricAnnotation>
            </EmissionsItem>
            <EqualSignDiv>=</EqualSignDiv>
            <EmissionsItem>
              <IconWrapper>
                <MetricNumber>
                  {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.treeEquivalent)}
                </MetricNumber>
                <TreeIcon size={23} fill='rgb(33, 33, 33)' />
              </IconWrapper>
              <MetricAnnotation>tree seedlings grown for 10 years</MetricAnnotation>
            </EmissionsItem>
            <EqualSignDiv>=</EqualSignDiv>
            <EmissionsItem>
              <IconWrapper>
                <MetricNumber>
                  {cardData.emissionsReduced === undefined ? 'N/A' : formatData(cardData.carsEquivalent)}
                </MetricNumber>
                <CarIcon size={50} fill='rgb(33, 33, 33)' />
              </IconWrapper>
              <MetricAnnotation>passenger cars taken off the road for 1 year</MetricAnnotation>
            </EmissionsItem>
          </EmissionsWrapper>
          <MetricLocation>
            { selectedGeography }
          </MetricLocation>
        </Card>
      </Wrapper>
    </>
  );
};
