import sortBy from 'lodash.sortby';
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProjectLevelDataType, CountryData, CountryIndicatorDataType } from '../Types';
// import { ProjectLevelDataType, CountryData } from '../Types';
import { Bars } from './Bars';

interface Props {
  data: ProjectLevelDataType[];
  countries: string[];
  countriesData: CountryData[];
}

interface CellProps {
  width: string;
  cursor?: string;
}

const CellEl = styled.div<CellProps>`
  width: ${(props) => props.width};
  cursor: ${(props) => (props.cursor ? props.cursor : 'auto')};
`;

export const ProjectsTable = (props: Props) => {
  const {
    data,
    countries,
    countriesData,
  } = props;
  const queryParams = new URLSearchParams(window.location.search);
  const queryCountry = queryParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [tableData, setTableData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [countryDataValues, setCountryDataValues] = useState<CountryIndicatorDataType[]>([]);
  const dataSorted = sortBy(data, 'Lead Country');
  useEffect(() => {
    // if (queryCountry)setSelectedCountry(queryCountry);
    const dataByCountry = selectedCountry === undefined || selectedCountry === 'All' ? dataSorted : dataSorted.filter((d) => d['Lead Country'] === selectedCountry);
    const indicatorsByCountry = selectedCountry === undefined || selectedCountry === 'All' ? [] : countriesData.filter((d) => d.country === selectedCountry)[0].values;
    setCountryDataValues(indicatorsByCountry);
    setTableData(dataByCountry);
    // eslint-disable-next-line no-console
    console.log('data by country', countriesData, indicatorsByCountry);
  }, [selectedCountry]);
  return (
    <>
      {queryCountry ? ` for ${countries.filter((d) => d === queryCountry)[0]}` : null}
      {
      !queryCountry
        ? (
          <div className='flex-div flex-space-between margin-bottom-07'>
            <div style={{ width: `${!queryCountry ? 'calc(50% - 0.5rem)' : '100%'}` }}>
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
          <div className='stat-container flex-div margin-bottom-05'>
            <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
              <h6 className='undp-typography'>Population with access to electricity</h6>
              <Bars
                values={countryDataValues}
                indicator='electricityAccess'
              />
            </div>
            <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
              <h6 className='undp-typography'>Population with access to clean cooking</h6>
              <Bars
                values={countryDataValues}
                indicator='cleancooking'
              />
            </div>
            <div className='stat-card' style={{ width: 'calc(25% - 4.75rem)' }}>
              <h6 className='undp-typography'>Poverty headcount ratio</h6>
              <h2>10%</h2>
              <p>living at $2.15 a day</p>
            </div>
          </div>
        ) : null
      }
      {
        tableData
          ? (
            <div style={{ maxHeight: '40rem', borderBottom: '1px solid var(--gray-400)' }} className='undp-scrollbar'>
              <div style={{ width: '100%' }}>
                <div className='undp-table-head-small undp-table-head-sticky' style={{ minWidth: '67.5rem' }}>
                  <CellEl width='10%' className='undp-table-head-cell undp-sticky-head-column'>
                    Country
                  </CellEl>
                  <CellEl width='15%' className='undp-table-head-cell'>
                    Project title
                  </CellEl>
                  <CellEl width='35%' className='undp-table-head-cell'>
                    Project description
                  </CellEl>
                  <CellEl width='20%' className='undp-table-head-cell'>
                    Source of Funds
                  </CellEl>
                  <CellEl width='10%' className='undp-table-head-cell'>
                    Amount
                  </CellEl>
                  <CellEl width='10%' className='undp-table-head-cell'>
                    Source
                  </CellEl>
                </div>
                {
                  tableData.map((d, i) => (
                    <div key={i} className='undp-table-row' style={{ minWidth: '67.5rem' }}>
                      <CellEl width='10%' className='undp-table-row-cell-small'>
                        {d['Lead Country']}
                      </CellEl>
                      <CellEl width='15%' className='undp-table-row-cell-small'>
                        {d['Short Title']}
                      </CellEl>
                      <CellEl width='35%' className='undp-table-row-cell-small'>
                        {d['Project Description']}
                      </CellEl>
                      <CellEl width='20%' className='undp-table-row-cell-small'>
                        {d['Source of Funds']}
                      </CellEl>
                      <CellEl width='10%' className='undp-table-row-cell-small'>
                        {d['Grant amount']}
                      </CellEl>
                      <CellEl width='10%' className='undp-table-row-cell-small'>
                        <a href={d.Source_documentation} target='_blank' rel='noreferrer'>{d.Source_documentation}</a>
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
