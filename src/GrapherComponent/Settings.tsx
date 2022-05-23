import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import domtoimage from 'dom-to-image';
import { CtxDataType, IndicatorMetaDataType, DataType } from '../Types';
import Context from '../Context/Context';
import { DEFAULT_VALUES } from '../Constants';
import {
  ChevronDown, ChevronLeft,
} from '../Icons';

interface Props {
  indicators: IndicatorMetaDataType[];
  regions: string[];
  countries: string[];
  data: DataType[];
}

const El = styled.div`
  width: 25%;
  box-shadow: var(--shadow-right);
  height: 74rem;
  padding: 2rem;
  border-right: 1px solid var(--black-400);
  overflow: auto;
  @media (max-width: 960px) {
    width: 100%;
    box-shadow: var(--shadow-bottom);
    border-right: 0px solid var(--black-400);
    padding-bottom: 0;
    height: auto;
  }  
`;

const DropdownEl = styled.div`
  margin: 2rem 0;
  &:first-of-type{
    margin-top: 0;
  }
`;

const DropdownTitle = styled.div`
  font-size: 1.4rem;
  color: var(--black-700);
  margin-bottom: 1rem;
  line-height: 1.8rem;
`;

const FiltersEl = styled.div`
  padding: 1rem 0 0 0;
  border-top: 1px solid var(--black-400);
  @media (max-width: 960px) {
    padding: 2rem 0;
  }  
`;

const FilterTitle = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-left: -5px;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const ButtonEl = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0 2rem 0;
  button {
    margin: 0.5rem 1rem 0.5rem 0;
  }
`;

const AccordionIconEl = styled.div`
  display: flex;
`;

export const Settings = (props: Props) => {
  const {
    indicators,
    regions,
    countries,
    data,
  } = props;
  const {
    graphType,
    xAxisIndicator,
    selectedCountries,
    selectedRegions,
    updateXAxisIndicator,
    updateSelectedRegions,
    updateSelectedCountries,
  } = useContext(Context) as CtxDataType;

  const options = indicators.filter((d) => d.Map).map((d) => d.IndicatorLabelTable);
  const [filterExpanded, setFilterExpanded] = useState(true);
  const availableCountries = selectedRegions.length > 0 ? data.filter((d) => selectedRegions.indexOf(d['Group 2']) > -1).map((d) => d['Country or Area']) : countries;
  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [graphType, options]);
  return (
    <El>
      <DropdownEl>
        <DropdownTitle>
          Select Indicator
        </DropdownTitle>
        <Select
          showSearch
          style={
            {
              width: '100%',
              borderRadius: '1rem',
            }
          }
          placeholder='Please select'
          value={xAxisIndicator}
          onChange={(d) => { updateXAxisIndicator(d); }}
          defaultValue={DEFAULT_VALUES.firstMetric}
        >
          {
            options.map((d) => (
              <Select.Option key={d}>{d}</Select.Option>
            ))
          }
        </Select>
      </DropdownEl>
      <FiltersEl>
        <FilterTitle onClick={() => { setFilterExpanded(!filterExpanded); }}>
          <AccordionIconEl>
            {
              filterExpanded
                ? <ChevronDown fill='#212121' size={20} /> : <ChevronLeft fill='#212121' size={20} />
            }
          </AccordionIconEl>
          <div style={{ marginTop: '2px' }}>
            Filter or Highlight By
          </div>
        </FilterTitle>
        <div style={{ display: filterExpanded ? 'inline' : 'none' }}>
          <DropdownEl>
            <DropdownTitle>
              Region
            </DropdownTitle>
            <Select
              allowClear
              style={{ width: '100%' }}
              placeholder='Filter By Regions'
              value={selectedRegions}
              onChange={(d: string) => { updateSelectedRegions(d === undefined ? '' : d); }}
            >
              {
              regions.map((d) => (
                <Select.Option key={d}>{d}</Select.Option>
              ))
            }
            </Select>
          </DropdownEl>
          <DropdownEl>
            <DropdownTitle>
              Countries
            </DropdownTitle>
            <Select
              allowClear
              style={{ width: '100%' }}
              value={selectedCountries}
              placeholder='Filter By Countries'
              onChange={(d: string) => { updateSelectedCountries(d === undefined ? '' : d); }}
            >
              {
                availableCountries.map((d) => (
                  <Select.Option key={d}>{d}</Select.Option>
                ))
              }
            </Select>
          </DropdownEl>
        </div>
      </FiltersEl>
      <ButtonEl>
        <button
          className='primary'
          type='button'
          onClick={() => {
            const node = document.getElementById('graph-node') as HTMLElement;
            domtoimage
              .toPng(node, { height: node.scrollHeight })
              .then((dataUrl: any) => {
                const link = document.createElement('a');
                link.download = 'graph.png';
                link.href = dataUrl;
                link.click();
              });
          }}
        >
          Download Graph
        </button>
      </ButtonEl>
    </El>
  );
};
