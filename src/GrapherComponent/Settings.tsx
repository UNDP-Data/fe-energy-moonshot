import { useContext } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import { CtxDataType, RegionDataType } from '../Types';
import Context from '../Context/Context';

interface Props {
  regions: RegionDataType[];
}

const El = styled.div`
  padding: 0 1rem 0 1rem;
  display: flex;
  align-items: end;
  gap: 2rem;

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
    value: 'Energy Efficiency',
    label: 'Energy Efficiency',
  },
  {
    value: 'Energy Access',
    label: 'Energy Access',
  },
  {
    value: 'Renewable Energy',
    label: 'Renewable Energy',
  },
  {
    value: 'Transport',
    label: 'Transport',
  },
  {
    value: 'Others',
    label: 'Others',
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
  return (
    <El>
      <DropdownEl
        width='calc(25% - 1rem)'
      >
        <FilterTitle>
          Select a Bureau
        </FilterTitle>
        <Select
          className='select-box'
          placeholder='Select a bureau'
          value={selectedRegions}
          onChange={(d: string) => { updateSelectedRegions(d === undefined ? 'All' : d); }}
        >
          <Select.Option key='All'>All Regions</Select.Option>
          {
            regions.map((d) => (
              <Select.Option key={d.value}>{d.label}</Select.Option>
            ))
          }
        </Select>
      </DropdownEl>
      <DropdownEl
        width='calc(25% - 1rem)'
      >
        <FilterTitle>
          Select a Project Category
        </FilterTitle>
        <Select
          className='select-box'
          placeholder='Select a project category'
          value={selectedTaxonomy}
          onChange={(d: string) => { updateSelectedTaxonomy(d === undefined ? 'All' : d); }}
        >
          {
            TaxonomyList.map((d) => (
              <Select.Option key={d.value}>{d.label}</Select.Option>
            ))
          }
        </Select>
      </DropdownEl>
    </El>
  );
};
