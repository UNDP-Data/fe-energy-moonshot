import { useContext } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import { CtxDataType, RegionDataType } from '../Types';
import Context from '../Context/Context';

interface Props {
  regions: RegionDataType[];
}

const El = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 2rem;
  margin-bottom: 1rem;
  @media (max-width: 960px) {
    border-right: 0px solid var(--black-400);
    padding-bottom: 0;
  }  
`;

interface DropdownUnitProps {
  width?: string;
}

const DropdownEl = styled.div<DropdownUnitProps>`
  width: ${(props) => props.width || '100%'};
  margin-bottom: 2rem;
  min-width: 30rem;
  @media (max-width: 660px) {
    width: 100%;
    margin-bottom: 0;
    &:last-of-type {
      margin-bottom: 2rem;
    }
  }  
`;

const FilterTitle = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-bottom: 0rem;
`;

const TaxonomyList = [
  {
    value: 'All',
    label: 'All Categories',
  },
  {
    value: 'Cross-cutting',
    label: 'Cross-cutting',
  },
  {
    value: 'Energy Access',
    label: 'Energy Access',
  },
  {
    value: 'Energy Transition',
    label: 'Energy Transition',
  },
];

export const Settings = (props: Props) => {
  const {
    regions,
  } = props;
  const {
    selectedRegions,
    selectedTaxonomy,
    updateSelectedRegions,
    updateSelectedTaxonomy,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');
  return (
    <El>
      <DropdownEl
        width={!queryRegion ? 'calc(50% - 1rem)' : '100%'}
      >
        <FilterTitle>
          Select a Project Taxonomy*
        </FilterTitle>
        <Select
          className='select-box'
          placeholder='Select a project taxonomy'
          value={selectedTaxonomy}
          onChange={(d: string) => { updateSelectedTaxonomy(d === undefined ? 'All' : d); }}
        >
          {
            TaxonomyList.map((d) => (
              <Select.Option className='select-box-option' key={d.value}>{d.label}</Select.Option>
            ))
          }
        </Select>
      </DropdownEl>
      {
        !queryRegion
          ? (
            <DropdownEl
              width='calc(50% - 1rem)'
            >
              <FilterTitle>
                Select a Bureau
              </FilterTitle>
              <Select
                style={{ width: '100%' }}
                className='select-box'
                placeholder='Select a bureau'
                value={selectedRegions}
                dropdownMatchSelectWidth
                onChange={(d: string) => { updateSelectedRegions(d === undefined ? 'All' : d); }}
              >
                <Select.Option className='select-box-option' key='All'>All Regions</Select.Option>
                {
                  regions.map((d) => (
                    <Select.Option className='select-box-option' key={d.value}>{d.label}</Select.Option>
                  ))
                }
              </Select>
            </DropdownEl>
          ) : null
      }
    </El>
  );
};
