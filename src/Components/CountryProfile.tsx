import sortBy from 'lodash.sortby';
import sumBy from 'lodash.sumby';
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { format } from 'd3-format';
import parse from 'html-react-parser';
import { CountryMap } from './CountryMap';
import {
  ProjectLevelDataType,
  CountryData,
  CountryIndicatorDataType,
  DashboardDataType,
  CountryGroupDataType,
} from '../Types';
import { Bars } from '../GrapherComponent/Bars';

// import { CountryMap } from '../GrapherComponent/CountryMap';
// import { DonutChartCard } from './DonutChart';

interface Props {
  projectsData: ProjectLevelDataType[];
  countries: string[];
  countriesData: CountryData[];
  data: CountryGroupDataType[];
}

interface CellProps {
  width: string;
  cursor?: string;
}

const StatCardSmallFont = styled.div`
  color: var(--gray-500);
  font-size: 1rem;
  line-height: 1.4rem;
`;

const CellEl = styled.div<CellProps>`
  width: ${(props) => props.width};
  cursor: ${(props) => (props.cursor ? props.cursor : 'auto')};
`;

interface WidthProps {
  width: string;
}

const StatCardsDiv = styled.div<WidthProps>`
  width: ${(props) => props.width};
  position: relative;
`;

export const CountryProfile = (props: Props) => {
  const {
    projectsData,
    countries,
    countriesData,
    data,
  } = props;
  const queryParams = new URLSearchParams(window.location.search);
  const queryCountry = queryParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [tableData, setTableData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [countryDataValues, setCountryDataValues] = useState<CountryIndicatorDataType[]>([]);
  const [cardData, setCardData] = useState<DashboardDataType | undefined>(undefined);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType>();
  const projectsDataSorted = sortBy(projectsData, 'Lead Country');
  useEffect(() => {
    if (queryCountry)setSelectedCountry(queryCountry);
    const dataByCountry = selectedCountry === undefined || selectedCountry === 'All' ? projectsDataSorted : projectsDataSorted.filter((d) => d['Lead Country'] === selectedCountry);
    const indicatorsByCountry = selectedCountry === undefined || selectedCountry === 'All' ? [] : countriesData.filter((d) => d.country === selectedCountry)[0].values;
    setCountryDataValues(indicatorsByCountry);
    setTableData(dataByCountry);
    const relevantData = selectedCountry !== undefined || selectedCountry === 'All'
      ? projectsData.filter((d) => d['Lead Country'] === selectedCountry)
      : projectsData;
    const cardDataValues = {
      peopleBenefiting: sumBy(relevantData, 'target_total'),
      grantAmount: sumBy(relevantData, 'Grant amount'),
      numberProjects: relevantData.length,
    };
    setCardData(cardDataValues);
    const countryData = data.filter((d) => d['Country or Area'] === selectedCountry)[0];
    setCountryGroupData(countryData);
    // eslint-disable-next-line no-console
    console.log('data', data);
  }, [selectedCountry]);
  // <CountryMap
  // selectedCountry={data.filter((d) => d['Country or Area'] === selectedCountry)[0]}
  // />
  const formatPercent = (d: any) => {
    // eslint-disable-next-line no-console
    if (d === 'n/a') return d;
    return `${d}%`;
  };
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 100000) return format(',')(parseFloat(d.toFixed(0)));
    return format('.3s')(d).replace('G', 'B');
  };
  return (
    <>
      {queryCountry ? <h2>{queryCountry}</h2> : null}
      {
      !queryCountry
        ? (
          <div className='flex-div flex-space-between margin-bottom-07'>
            <div>
              <h2>This section is being designed (see Figma page)</h2>
              <p className='label'>Select a Country </p>
              <Select
                className='undp-select'
                placeholder='Select a country'
                value={selectedCountry}
                showSearch
                onChange={(d) => { setSelectedCountry(d); }}
              >
                <Select.Option className='undp-select-option' key='All'>All Countries</Select.Option>
                {
                  countries.map((d) => (
                    <Select.Option className='undp-select-option' key={d}>{d}</Select.Option>
                  ))
                }
              </Select>
            </div>
          </div>
        ) : null
      }
      {
      selectedCountry !== undefined && countryDataValues.length > 0
        ? (
          <div className='margin-top-1'>
            <CountryMap country={countryGroupData} />
            <div className='stat-card-container margin-bottom-05 flex-space-between'>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h2>
                <p className='undp-typography margin-bottom-10 margin-top-00'>Total grant amount (USD)</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h2>
                <p className='undp-typography margin-bottom-10 margin-top-00'>Target number of beneficiaries</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h6 className='undp-typography margin-bottom-03'>Investment Gap for Universal Access*, Million USD</h6>
                <p className='undp-typography'>Cumulative 2022-2030</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'investment_gap_total')[0].value}M (USD)`}</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'investment_gap_urban')[0].value}M (USD)`}</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'investment_gap_rural')[0].value}M (USD)`}</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: SDG Push+: Accelerating universal electricity access and its effects on sustainable development indicators</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h6 className='undp-typography margin-bottom-03'>Human Development Index</h6>
                <p className='undp-typography'>2021</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'hdi')[0].value}`}</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'life_exp')[0].value} years`}</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'schooling')[0].value} years`}</p>
                <p className='undp-typography'>{`${countryDataValues.filter((d:any) => d.indicator === 'income')[0].value} (2017 PPP USD)`}</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: </StatCardSmallFont>
              </StatCardsDiv>
            </div>
            <div className='stat-card-container margin-bottom-05 flex-space-between'>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h6 className='undp-typography margin-bottom-00'>Poverty headcount ratio</h6>
                <StatCardSmallFont>{countryDataValues.filter((d) => d.indicator === 'poverty_headcount')[0].year}</StatCardSmallFont>
                <h2>{`${formatPercent(countryDataValues.filter((d:any) => d.indicator === 'poverty_headcount')[0].value)}`}</h2>
                <p className='undp-typography'>living at $2.15 a day</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: World Bank</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h6 className='undp-typography margin-bottom-00'>Population with access to electricity</h6>
                <StatCardSmallFont>{countryDataValues.filter((d) => d.indicator === 'electricityAccess_sharet')[0].year}</StatCardSmallFont>
                <Bars
                  values={countryDataValues}
                  indicator='electricityAccess'
                />
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: Tracking SDG 7: The Energy Progress Report</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
                <h6 className='undp-typography margin-bottom-00'>Population with access to clean cooking</h6>
                <StatCardSmallFont>{countryDataValues.filter((d) => d.indicator === 'cleancooking_sharet')[0].year}</StatCardSmallFont>
                <Bars
                  values={countryDataValues}
                  indicator='cleancooking'
                />
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: Tracking SDG 7: The Energy Progress Report</StatCardSmallFont>
              </StatCardsDiv>
            </div>
          </div>
        ) : null
      }
      {
        tableData
          ? (
            <div style={{ maxHeight: '40rem', borderBottom: '1px solid var(--gray-400)' }} className='undp-scrollbar'>
              <div style={{ width: '100%' }}>
                <div className='undp-table-head-small undp-table-head-sticky'>
                  <CellEl width='8%' className='undp-table-head-cell undp-sticky-head-column'>
                    Country
                  </CellEl>
                  <CellEl width='12%' className='undp-table-head-cell'>
                    Project title
                  </CellEl>
                  <CellEl width='40%' className='undp-table-head-cell'>
                    Project description
                  </CellEl>
                  <CellEl width='20%' className='undp-table-head-cell'>
                    Source of Funds
                  </CellEl>
                  <CellEl width='10%' className='undp-table-head-cell'>
                    Grant amount (USD)
                  </CellEl>
                  <CellEl width='10%' className='undp-table-head-cell'>
                    Source
                  </CellEl>
                </div>
                {
                  tableData.map((d, i) => (
                    <div key={i} className='undp-table-row' style={{ minWidth: '67.5rem' }}>
                      <CellEl width='8%' className='undp-table-row-cell-small'>
                        {d['Lead Country']}
                      </CellEl>
                      <CellEl width='12%' className='undp-table-row-cell-small'>
                        {d['Short Title']}
                      </CellEl>
                      <CellEl width='40%' className='undp-table-row-cell-small'>
                        {d['Project Description'] !== undefined
                          ? parse(d['Project Description'].replaceAll('\n', '<br>')) : null}
                      </CellEl>
                      <CellEl width='20%' className='undp-table-row-cell-small'>
                        {d['Source of Funds']}
                      </CellEl>
                      <CellEl width='10%' className='undp-table-row-cell-small' style={{ whiteSpace: 'nowrap' }}>
                        {format(',')(parseFloat(d['Grant amount'].toFixed(0))).replaceAll(',', ' ')}
                      </CellEl>
                      <CellEl width='10%' className='undp-table-row-cell-small'>
                        <a href={d.Source_documentation} className='undp-style' target='_blank' rel='noreferrer'>{d.Source_documentation}</a>
                      </CellEl>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : null
      }
    </>
  );
};
