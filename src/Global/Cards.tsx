import { useContext } from 'react';
import sumBy from 'lodash.sumby';
import styled from 'styled-components';
import { format } from 'd3-format';
import { useTranslation } from 'react-i18next';
import { CtxDataType, DataType } from '../Types';
import Context from '../Context/Context';

interface WidthProps {
  width: string;
}

const StatCardsDiv = styled.div<WidthProps>`
  width: ${(props) => props.width};
`;

interface Props {
  data: DataType[];
}

export const Cards = (props: Props) => {
  const {
    data,
  } = props;
  const {
    selectedCategory,
  } = useContext(Context) as CtxDataType;

  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;
    if (d < 10000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };
  //
  // const relevantData = selectedCountries.length > 0
  //   ? data.filter((d) => d['Country or Area'] === selectedCountries)
  //   : selectedRegions !== 'All'
  //     ? data.filter((d) => d.region === selectedRegions) : data;
  console.log(data);
  const cardData = {
    numberProjects: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === 'nProj')[0].value),
    peopleBenefiting: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === 'directBeneficiaries')[0].value),
    mwAdded: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === 'mwAdded')[0].value),
    grantAmount: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === 'budget')[0].value),
    policies: sumBy(data, (d:any) => d.indicators.filter((i:any) => i.indicator === 'policies')[0].value),
    numberCountries: data.length,
  };
  // translation
  const { t } = useTranslation();

  return (
    <>
      <div className='stat-container flex-div margin-bottom-05'>
        <StatCardsDiv className='stat-card' width='calc(25% - 1.334rem)'>
          {
            (selectedCategory === 'Energy Transition') && (
              <>
                <h3 className='undp-typography'>
                  {cardData.mwAdded === undefined ? 'N/A' : formatData(cardData.mwAdded)}
                </h3>
                <p>{t('mw-added')}</p>
              </>
            )
          }
          {
            (selectedCategory === 'Energy Access') && (
              <>
                <h3 className='undp-typography'>
                  {cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}
                </h3>
                <p>{t('people-benefiting')}</p>
              </>
            )
          }
          {
            (selectedCategory === 'Policy') && (
              <>
                <h3 className='undp-typography'>
                  {!cardData.policies ? 'N/A' : formatData(cardData.policies)}
                </h3>
                <p>{t('number-of-policies')}</p>
              </>
            )
          }
          {
            (selectedCategory === 'Market Development') && (
              <>
                <h3 className='undp-typography'>
                  N/A
                </h3>
              </>
            )
          }
          {
            (selectedCategory === 'all') && (
              ((cardData.peopleBenefiting) && (
                <>
                  <h3 className='undp-typography'>
                    {cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}
                  </h3>
                  <p>{t('people-benefiting')}</p>
                </>
              ))
              || ((cardData.mwAdded) && (
                <>
                  <h3 className='undp-typography'>
                    {cardData.mwAdded === undefined ? 'N/A' : formatData(cardData.mwAdded)}
                  </h3>
                  <p>{t('mw-added')}</p>
                </>
              ))
              || ((cardData.policies) && (
                <>
                  <h3 className='undp-typography'>
                    {cardData.policies === undefined ? 'N/A' : formatData(cardData.policies)}
                  </h3>
                  <p>{t('number-of-policies')}</p>
                </>
              ))
              || (
                <>
                  <h3 className='undp-typography'>
                    N/A
                  </h3>
                </>
              )
            )
          }
        </StatCardsDiv>
        <StatCardsDiv className='stat-card' width='calc(25% - 1.334rem)'>
          <h3 className='undp-typography'>{formatData(cardData.numberProjects)}</h3>
          <p>{t('number-projects')}</p>
        </StatCardsDiv>
        <StatCardsDiv className='stat-card' width='calc(25% - 1.334rem)'>
          <h3 className='undp-typography'>{formatData(cardData.numberCountries)}</h3>
          <p>{t('number-countries')}</p>
        </StatCardsDiv>
        <StatCardsDiv className='stat-card' width='calc(25% - 1.334rem)'>
          <h3 className='undp-typography'>{cardData.grantAmount === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h3>
          <p>{t('total-grant-usd')}</p>
        </StatCardsDiv>
      </div>
    </>
  );
};
