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
import { ScaledSquare } from '../GrapherComponent/ScaledSquare';
import { ScaledHalfCircles } from '../GrapherComponent/ScaledHalfCircles';
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import '../styles/style.css';

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

const maxValueInvGdp = (countryValues:any) => {
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
const maxValuePeople = (countryValues:any) => {
  let max = 0;
  const ind = ['cum_averteddeaths_2030', 'cum_averteddeaths_2050', 'poverty_reduction_2030_million', 'poverty_reduction_2050_million'];
  ind.forEach((indicator) => {
    const factor = (indicator.slice(indicator.length - 7) === 'million') ? 1000000 : 1;
    console.log('factor', factor);
    const value:number = Math.abs(countryValues.filter((d:any) => d.indicator === indicator)[0].value * factor);
    if (value > max) max = value;
  });
  console.log('max', max);
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
  const [selectedCountry, setSelectedCountry] = useState<string>(countries[0]);
  const [tableData, setTableData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [countryDataValues, setCountryDataValues] = useState<CountryIndicatorDataType[]>([]);
  const [cardData, setCardData] = useState<DashboardDataType | undefined>(undefined);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType>(data[0]);
  const projectsDataSorted = sortBy(projectsData, 'Lead Country');
  const indValue = (ind:string) => {
    console.log('ind---------> ', ind, countryDataValues);
    return countryDataValues.filter((d) => d.indicator === ind)[0].value;
  };
  /* const maxValue = (ind1:string, ind2:string) => {
    const value1 = Math.abs(indValue(ind1));
    const value2 = Math.abs(indValue(ind2));
    if (value1 > value2) return value1;
    return value2;
  }; */
  useEffect(() => {
    if (queryCountry)setSelectedCountry(queryCountry);
    const dataByCountry = selectedCountry === undefined || selectedCountry === 'All' ? projectsDataSorted : projectsDataSorted.filter((d) => d['Lead Country'] === selectedCountry);
    const indicatorsByCountry = selectedCountry === undefined || selectedCountry === 'All' ? [] : countriesData.filter((d) => d.country === selectedCountry)[0].values;
    setCountryDataValues(indicatorsByCountry);
    console.log('indicatorBycountry', indicatorsByCountry);
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
  }, [selectedCountry]);

  const formatPercent = (d: any) => {
    if (d === 'n/a') return d;
    return `${d}%`;
  };
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 1000000) return format(',')(d).replaceAll(',', ' ');
    return format('.3s')(d).replace('G', 'B').replaceAll(',', ' ');
  };
  const formatBillion = (d: any) => {
    if (d > 1) return `${d}B`;
    return `${d * 1000}M`;
  };
  const formatMillion = (d: any) => {
    if (d > 1) return `${d}M`;
    return `${d * 1000}K`;
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
            <div className={`${indValue('hrea_2020') === '' ? 'hide-div' : ''}`}>
              <h4 className='undp-typography'>{`Reliable access to electricity in ${selectedCountry}: latest status`}</h4>
              <p className='undp-typography'>
                {`The latest estimates of access to reliable electricity for ${selectedCountry} based on satellite data indicates that ${(indValue('hrea_2020') === '') ? '0%' : formatPercent(Math.round(100 - indValue('hrea_2020') * 100))} (${formatData(indValue('pop_no_hrea_2020'))} people) of the population does not benefit from electrification. Significant differences in access are still visible at sub-national levels – as shown on the district-level map below.`}
              </p>
              <div className='flex-div flex-wrap vis-container-1'>
                <div style={{ flex: '2 1 27rem' }}>
                  <CountryMap country={countryGroupData} />
                  <div className='small-font'>
                    <ol>
                      <li>
                        Reliable electricity access 2020 estimates based on data from satellite imagery (University of Michigan). For more details, check:
                        <a className='undp-style' href='http://www-personal.umich.edu/~brianmin/HREA/methods.html' target='_blank' rel='noreferrer'> http://www-personal.umich.edu/~brianmin/HREA/methods.html</a>
                      </li>
                      <li>
                        Relative wealth index from Facebook (2015) For more details, check:
                        <a className='undp-style' href='https://dataforgood.facebook.com/dfg/tools/relative-wealth-index' target='_blank' rel='noreferrer'> https://dataforgood.facebook.com/dfg/tools/relative-wealth-index</a>
                      </li>
                    </ol>
                  </div>
                </div>
                <div style={{ flex: '1 1 12rem' }}>
                  <div className='stat-card margin-top-07'>
                    <div style={{ height: '340px' }} className='column-flex'>
                      <div>
                        <h6 className='undp-typography margin-bottom-01'>Population without access to reliable energy services</h6>
                        <div className='stat-card-notes margin-bottom-06'>2020</div>
                      </div>
                      <div>
                        <h3 className='undp-typography margin-bottom-00'>{(indValue('hrea_2020') === '') ? '0%' : formatPercent(Math.round(100 - indValue('hrea_2020') * 100))}</h3>
                        <div className='stat-card-description'>{`${formatData(indValue('pop_no_hrea_2020'))} people`}</div>
                      </div>
                      <div className='stat-card-source'>
                        Source: Reliable electricity access 2020 estimates based on data from satellite imagery (University of Michigan).
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className='undp-typography margin-top-07'>{`Achieving Universal Access in ${selectedCountry}`}</h4>
              <div>
                {
                indValue('poverty_reduction_2030_million') < 0
                  ? (
                    <p className='undp-typography'>
                      {`Currently levels of investments are not sufficient to expand access to all. Providing electrification to ${formatData(indValue('pop_no_hrea_2020'))} people in ${selectedCountry} requires a cumulative amount of investments of more than USD ${formatBillion(indValue('InvTotal_cum_2030_bi'))} between now and 2030, including more than USD ${formatBillion(indValue('InvRural_cum2030_bi'))} on expanding rural access alone. Expansion to access at this scale can provide economic and development benefits, such as cumulative GDP gains reaching USD ${formatBillion(indValue('GDPgains_cum2050_bi'))} by 2050, poverty reduction of ${indValue('poverty_reduction_2050_%').replace('-', '')} (which is equivalent to lifting ${formatMillion(Math.abs(indValue('poverty_reduction_2050_million')))} people out of extreme poverty by mid-century and avoiding ${formatData(Math.abs(indValue('cum_averteddeaths_2050')))} deaths by 2050 due to the reduction of use of traditional cookstoves.`}
                    </p>
                  ) : (
                    <p className='undp-typography'>
                      {`Currently levels of investments are not sufficient to expand access to all. Providing electrification to ${formatData(indValue('pop_no_hrea_2020'))} people in ${selectedCountry} requires a cumulative amount of investments of more than USD ${formatBillion(indValue('InvTotal_cum_2030_bi'))} between now and 2030, including more than USD ${formatBillion(indValue('InvRural_cum2030_bi'))} on rural areas alone. Despite the short-term trade-offs in fiscal choices associated with the expansion of electrification, the long-term benefits of electricity access are translated into cumulative GDP gains reaching USD ${formatBillion(indValue('GDPgains_cum2050_bi'))} by 2050, poverty reduction of ${indValue('poverty_reduction_2050_%').replace('-', '')} (which is equivalent to lifting ${formatMillion(Math.abs(indValue('poverty_reduction_2050_million')))} people out of extreme poverty by mid-century and avoiding ${formatData(Math.abs(indValue('cum_averteddeaths_2050')))} deaths by 2050 due to the reduction of use of traditional cookstoves.`}
                    </p>
                  )
                }
              </div>
              <div className='margin-bottom-05'>
                <div>
                  <div className='flex-div flex-wrap vis-container-1'>
                    <div className='vis-div flex-inner-div-0'>
                      <h5 className='undp-typography margin-bottom-00'>Investment gap</h5>
                      <div className='legend-container' style={{ marginBottom: '52px' }}>
                        <div style={{ backgroundColor: 'var(--blue-300)' }} className='legend-square'>
                          &nbsp;
                        </div>
                        <div className='legend-label'>2030</div>
                        <div style={{ backgroundColor: 'var(--blue-600)' }} className='legend-square'>
                          &nbsp;
                        </div>
                        <div className='legend-label'>2050</div>
                      </div>
                      <div className='stat-card-notes margin-bottom-06'>Cumulative from 2022</div>
                      <ScaledSquare
                        values={countryDataValues}
                        indicators={['InvTotal_cum_2030_bi', 'InvTotal_cum_2050_bi']}
                        indicators2={[]}
                        maxValue={maxValueInvGdp(countryDataValues)}
                        unit='USD '
                        factor={1000000000}
                        invert={false}
                      />
                    </div>
                    <div className='vis-div flex-inner-div-1'>
                      <h5 className='undp-typography margin-bottom-00'>Benefits</h5>
                      <div className='margin-bottom-07 legend-container'>
                        <div style={{ backgroundColor: 'var(--blue-300)' }} className='legend-square'>
                          &nbsp;
                        </div>
                        <div className='legend-label'>2030</div>
                        <div style={{ backgroundColor: 'var(--blue-600)' }} className='legend-square'>
                          &nbsp;
                        </div>
                        <div className='legend-label'>2050</div>
                      </div>
                      <div className='flex-div flex-wrap' style={{ rowGap: '2rem' }}>
                        <div className='flex-inner-div-1a'>
                          <h6 className='undp-typography margin-bottom-01'>GDP gains</h6>
                          <div className='stat-card-notes margin-bottom-06'>Cumulative from 2022</div>
                          <ScaledSquare
                            values={countryDataValues}
                            indicators={['GDPgains_cum2030_bi', 'GDPgains_cum2050_bi']}
                            indicators2={[]}
                            maxValue={maxValueInvGdp(countryDataValues)}
                            unit='USD '
                            factor={1000000000}
                            invert={false}
                          />
                        </div>
                        <div className='flex-inner-div-1a'>
                          <h6 className='undp-typography margin-bottom-01'>Poverty reduction</h6>
                          <div className='stat-card-notes margin-bottom-06'>By 2030/2050</div>
                          <ScaledHalfCircles
                            values={countryDataValues}
                            indicators={['poverty_reduction_2030_million', 'poverty_reduction_2050_million']}
                            indicators2={[(indValue('poverty_reduction_2030_%')).replace('-', ''), (indValue('poverty_reduction_2050_%')).replace('-', '')]}
                            maxValue={maxValuePeople(countryDataValues)}
                            unit=''
                            factor={1000000}
                            invert
                          />
                          {((indValue('poverty_reduction_2030_million') > 0) || (indValue('poverty_reduction_2050_million') > 0))
                            ? (
                              <div className='legend-container margin-top-04'>
                                <div style={{ border: 'var(--dark-red) 2px solid', backgroundColor: 'var(--blue-300)' }} className='legend-square'>
                                  &nbsp;
                                </div>
                                <div className='legend-label'>Increase in poverty</div>
                              </div>
                            ) : null }
                        </div>
                        <div className='flex-inner-div-1a'>
                          <h6 className='undp-typography margin-bottom-00'>Averted deaths *</h6>
                          <div className='stat-card-notes margin-bottom-06'>Cumulative from 2022</div>
                          <ScaledHalfCircles
                            values={countryDataValues}
                            indicators={['cum_averteddeaths_2030', 'cum_averteddeaths_2050']}
                            indicators2={[]}
                            maxValue={maxValuePeople(countryDataValues)}
                            unit=''
                            factor={1}
                            invert={false}
                          />
                          <p className='undp-typography small-font margin-top-05'>* due to the reduction of the use of traditional cookstoves</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='stat-card-source' style={{ paddingTop: '30px' }}>Source: SDG Push+: Accelerating universal electricity access and its effects on sustainable development indicators</div>
                </div>
              </div>
            </div>
            <h4 className='undp-typography margin-top-07'>{`Work of UNDP and partners in ${selectedCountry}`}</h4>
            <div className='stat-card-container margin-bottom-05 flex-space-between'>
              <StatCardsDiv className='stat-card' width='calc(50% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h2>
                <div className='stat-card-description margin-bottom-10 margin-top-00'>Total grant amount USD</div>
                <div className='stat-card-source' style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</div>
              </StatCardsDiv>
              <StatCardsDiv className='stat-card' width='calc(50% - 1.334rem)'>
                <h2 className='undp-typography'>{cardData === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h2>
                <div className='stat-card-description margin-bottom-10 margin-top-00'>Target number of beneficiaries</div>
                <div className='stat-card-source' style={{ position: 'absolute', bottom: '2rem' }}>Source: UNDP data (active projects)</div>
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
                    Grant amount USD
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
                        {formatData(parseFloat(d['Grant amount'].toFixed(0)))}
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
