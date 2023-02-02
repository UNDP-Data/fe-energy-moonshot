import sortBy from 'lodash.sortby';
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProjectCoordinateDataType } from '../Types';
// import Context from '../Context/Context';

// import '../style/switchStyle.css';

interface Props {
  data: ProjectCoordinateDataType[];
}

interface CellProps {
  width: string;
  cursor?: string;
}

function removeDuplicates(arr: any) {
  return arr.filter((item: any, index: number) => arr.indexOf(item) === index);
}

const CellEl = styled.div<CellProps>`
  width: ${(props) => props.width};
  cursor: ${(props) => (props.cursor ? props.cursor : 'auto')};
`;

export const ProjectsTable = (props: Props) => {
  const {
    data,
  } = props;
  const countries = removeDuplicates(data.map((d) => d['Lead Country']));
  const queryParams = new URLSearchParams(window.location.search);
  const queryCountry = queryParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [tableData, setTableData] = useState<ProjectCoordinateDataType[] | undefined>(undefined);
  const dataSorted = sortBy(data, 'Lead Country');
  useEffect(() => {
    if (queryCountry)setSelectedCountry(queryCountry);
    const dataByCountry = selectedCountry === undefined || selectedCountry === 'All' ? dataSorted : dataSorted.filter((d) => d['Lead Country'] === selectedCountry);
    // eslint-disable-next-line no-console
    // console.log('data by country', selectedCountry, dataByCountry);
    setTableData(dataByCountry);
  }, [selectedCountry]);
  // eslint-disable-next-line no-console
  console.log('selectedCountry country ', selectedCountry);
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
        tableData
          ? (
            <div style={{ maxHeight: '40rem', borderBottom: '1px solid var(--gray-400)' }} className='undp-scrollbar'>
              <div style={{ width: '100%' }}>
                <div className='undp-table-head-small undp-table-head-sticky' style={{ minWidth: '67.5rem' }}>
                  <CellEl width='15%' className='undp-table-head-cell undp-sticky-head-column'>
                    Country
                  </CellEl>
                  <CellEl width='20%' className='undp-table-head-cell'>
                    Project short title
                  </CellEl>
                  <CellEl width='65%' className='undp-table-head-cell'>
                    Amount
                  </CellEl>
                </div>
                {
                  tableData.map((d, i) => (
                    <div key={i} className='undp-table-row' style={{ minWidth: '67.5rem' }}>
                      <CellEl width='15%' className='undp-table-row-cell-small'>
                        {d['Lead Country']}
                      </CellEl>
                      <CellEl width='60%' className='undp-table-row-cell-small'>
                        {d['Short Title']}
                      </CellEl>
                      <CellEl width='25%' className='undp-table-row-cell-small'>
                        {d['Grant Amount']}
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
