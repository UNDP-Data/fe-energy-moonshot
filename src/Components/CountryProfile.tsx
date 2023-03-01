import sortBy from 'lodash.sortby';
import sumBy from 'lodash.sumby';
import { Select, Radio } from 'antd';
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
import { ScaledSquare } from '../GrapherComponent/ScaledSquare';
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

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

const maxValue = (countryValues:any) => {
  let max = 0;
  const ind = ['InvTotal_cum_', 'GDPgains_cum'];
  ['2030', '2050'].forEach((year) => {
    ind.forEach((indicator) => {
      const value:number = Number(countryValues.filter((d:any) => d.indicator === `${indicator}${year}_bi`)[0].value);
      if (value > max) max = value;
    });
  });
  return max;
};

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
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType>(data[0]);
  const projectsDataSorted = sortBy(projectsData, 'Lead Country');
  const [activeYear, setSelectedYear] = useState<string>('2030');
  useEffect(() => {
    setSelectedYear('2030');
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
    console.log('indicators by country', indicatorsByCountry);
  }, [selectedCountry]);

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
              <p className='label'>Select a Country </p>
              <Select
                className='undp-select'
                placeholder='Select a country'
                value={selectedCountry}
                showSearch
                style={{ width: '400px' }}
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
            <h4 className='undp-typography'>{`Reliable access to electricity in ${selectedCountry}: latest status`}</h4>
            <div className='flex-div'>
              <div style={{ flex: '2' }}>
                <CountryMap country={countryGroupData} />
                <i>legend map to be added!, the map will be scaled according to the size + other fixes necessary</i>
                <StatCardSmallFont>HREA data source:... (2020), Poverty data source: ... (2015)</StatCardSmallFont>
              </div>
              <div style={{ flex: '1' }}>
                <StatCardsDiv className='stat-card margin-top-07' width='96%'>
                  <h6 className='undp-typography margin-bottom-06'>Population with access to reliable energy services</h6>
                  <h3 className='undp-typography'>{formatPercent(Math.round(countryDataValues.filter((d) => d.indicator === 'hrea_2020')[0].value * 100))}</h3>
                  <p className='undp-typography'>{`${format(',')(countryDataValues.filter((d) => d.indicator === 'pop_hrea_2020')[0].value)} people`}</p>
                  <StatCardSmallFont>2020</StatCardSmallFont>
                  <StatCardSmallFont>Source: </StatCardSmallFont>
                </StatCardsDiv>
              </div>
            </div>
            <h4 className='undp-typography margin-top-05'>{`Achieving Universal Access in ${selectedCountry}`}</h4>
            <div className='stat-card-container margin-bottom-05 flex-space-between'>
              <StatCardsDiv className='stat-card' width='100%'>
                <div className='flex-wrap margin-bottom-07'>
                  <Radio.Group defaultValue={activeYear}>
                    <Radio
                      className='undp-radio'
                      value='2030'
                      onChange={(e) => { setSelectedYear(e.target.value); }}
                    >
                      2030
                    </Radio>
                    <Radio
                      className='undp-radio'
                      value='2050'
                      onChange={(e) => { setSelectedYear(e.target.value); }}
                    >
                      2050
                    </Radio>
                  </Radio.Group>
                </div>
                <div className='flex-div'>
                  <div style={{ flex: '1', borderRight: '2px dotted #888' }}>
                    <h5 className='undp-typography margin-bottom-08'>Investment gap</h5>
                    <ScaledSquare
                      values={countryDataValues}
                      year={activeYear}
                      indicator='InvTotal_cum_'
                      maxValue={maxValue(countryDataValues)}
                    />
                    <p className='undp-typography'>{`Cumulative 2022-${activeYear}`}</p>
                  </div>
                  <div style={{ flex: '3', paddingLeft: '20px' }}>
                    <h5 className='undp-typography'>Benefits</h5>
                    <div className='flex-div'>
                      <div style={{ flex: '1' }}>
                        <h6 className='undp-typography'>GDP gains</h6>
                        <ScaledSquare
                          values={countryDataValues}
                          year={activeYear}
                          indicator='GDPgains_cum'
                          maxValue={maxValue(countryDataValues)}
                        />
                        <p className='undp-typography'>{`Cumulative 2022-${activeYear}`}</p>
                      </div>
                      <div style={{ flex: '1', paddingRight: '20px' }}>
                        <h6 className='undp-typography'>Poverty</h6>
                        <h3 className='undp-typography'>{format(',')(Math.abs(countryDataValues.filter((d:any) => d.indicator === `poverty_reduction_${activeYear}_million`)[0].value * 1000000))}</h3>
                        <p>{`${(countryDataValues.filter((d:any) => d.indicator === `poverty_reduction_${activeYear}_million`)[0].value < 0) ? 'fewer' : 'more'} people living in extreme poverty (${countryDataValues.filter((d:any) => d.indicator === `poverty_reduction_${activeYear}_%`)[0].value} ${(countryDataValues.filter((d:any) => d.indicator === `poverty_reduction_${activeYear}_million`)[0].value < 0) ? 'less' : 'more'})`}</p>
                        <p className='undp-typography'>{`by ${activeYear}`}</p>
                      </div>
                      <div style={{ flex: '1' }}>
                        <h6 className='undp-typography'>Deaths</h6>
                        <h3 className='undp-typography'>{countryDataValues.filter((d:any) => d.indicator === `averted_deaths_${activeYear}`)[0].value}</h3>
                        <p className='undp-typography'>averted deaths due to the reduction of the use of traditional cookstoves</p>
                        <p className='undp-typography'>{`by ${activeYear}`}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <StatCardSmallFont style={{ paddingTop: '30px' }}>Source: SDG Push+: Accelerating universal electricity access and its effects on sustainable development indicators</StatCardSmallFont>
              </StatCardsDiv>
            </div>
            <h4 className='undp-typography'>{`Work of UNDP in ${selectedCountry}`}</h4>
            <div className='stat-card-container margin-bottom-05 flex-space-between'>
              <StatCardsDiv className='stat-card' width='calc(50% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h2>
                <p className='undp-typography margin-bottom-10 margin-top-00'>Total grant amount (USD)</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</StatCardSmallFont>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(50% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h2>
                <p className='undp-typography margin-bottom-10 margin-top-00'>Target number of beneficiaries</p>
                <StatCardSmallFont style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</StatCardSmallFont>
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
