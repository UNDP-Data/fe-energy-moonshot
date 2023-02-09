import sortBy from 'lodash.sortby';
import sumBy from 'lodash.sumby';
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { format } from 'd3-format';
import {
  ProjectLevelDataType,
  CountryData,
  CountryIndicatorDataType,
  DashboardDataType,
} from '../Types';
import { Bars } from '../GrapherComponent/Bars';

interface Props {
  projectsData: ProjectLevelDataType[];
  countries: string[];
  countriesData: CountryData[];
}

interface CellProps {
  width: string;
  cursor?: string;
}

const StatCardSource = styled.div`
  position: relative;
  bottom: 0px;
  color: var(--gray-500);
  font-size: .7em;
`;

const CellEl = styled.div<CellProps>`
  width: ${(props) => props.width};
  cursor: ${(props) => (props.cursor ? props.cursor : 'auto')};
`;

export const CountryProfile = (props: Props) => {
  const {
    projectsData,
    countries,
    countriesData,
  } = props;
  const queryParams = new URLSearchParams(window.location.search);
  const queryCountry = queryParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [tableData, setTableData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [countryDataValues, setCountryDataValues] = useState<CountryIndicatorDataType[]>([]);
  const [cardData, setCardData] = useState<DashboardDataType | undefined>(undefined);
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
    // eslint-disable-next-line no-console
    console.log('data by country', relevantData);
  }, [selectedCountry]);
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 10000) return format(',')(parseFloat(d.toFixed(0))).replaceAll(',', ' ');
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
            <div className='flex-div margin-bottom-05 flex-space-between flex-wrap'>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <h3 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h3>
                <p>Total grant amount (USD)</p>
                <StatCardSource>Source: UNDP data (active projects)</StatCardSource>
              </div>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <h3 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h3>
                <p>Target number of beneficiaries</p>
                <StatCardSource>Source: UNDP data (active projects)</StatCardSource>
              </div>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <p>{`${countryDataValues.filter((d:any) => d.indicator === 'investment_gap_total')[0].value * 1000}M (USD)`}</p>
                <p>{countryDataValues.filter((d:any) => d.indicator === 'investment_gap_urban')[0].value}</p>
                <p>{countryDataValues.filter((d:any) => d.indicator === 'investment_gap_rural')[0].value}</p>
                <StatCardSource>Source: SDG Push+: Accelerating universal electricity access and its effects on sustainable development indicators</StatCardSource>
              </div>
            </div>
            <div className='flex-div margin-bottom-05 flex-space-between flex-wrap'>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <h6 className='undp-typography'>Poverty headcount ratio</h6>
                <h2>{countryDataValues.filter((d:any) => d.indicator === 'poverty_headcount')[0].value}</h2>
                <p>living at $2.15 a day</p>
              </div>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <h6 className='undp-typography'>Population with access to electricity</h6>
                <Bars
                  values={countryDataValues}
                  indicator='electricityAccess'
                />
              </div>
              <div className='stat-card' style={{ width: 'calc(33.33% - 1.334rem)' }}>
                <h6 className='undp-typography'>Population with access to clean cooking</h6>
                <Bars
                  values={countryDataValues}
                  indicator='cleancooking'
                />
              </div>
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
                        {d['Project Description']}
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
