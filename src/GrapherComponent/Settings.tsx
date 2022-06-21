import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Select, Checkbox } from 'antd';
import domtoimage from 'dom-to-image';
import { CtxDataType, IndicatorMetaDataType } from '../Types';
import Context from '../Context/Context';
import { DEFAULT_VALUES } from '../Constants';

interface Props {
  indicators: IndicatorMetaDataType[];
  regions: string[];
}

const El = styled.div`
  box-shadow: var(--shadow-bottom);
  padding: 1.5em 2em;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 2em;

  @media (max-width: 960px) {
    box-shadow: var(--shadow-bottom);
    border-right: 0px solid var(--black-400);
    padding-bottom: 0;
  }  
`;

const DropdownEl = styled.div`
  flex: 2;
`;

const DropdownTitle = styled.div`
  font-size: 1.4rem;
  color: var(--black-700);
  margin-bottom: 1rem;
  line-height: 1.8rem;
`;

const ButtonEl = styled.div`
  flex: 1;
  button {
    margin: 0.5rem 1rem 0.5rem 0;
  }
`;

const CheckboxContainer = styled.div` 
  flex: 1;
`;

const CheckboxEl = styled.div`
`;

export const Settings = (props: Props) => {
  const {
    indicators,
    regions,
  } = props;
  const {
    xAxisIndicator,
    selectedRegions,
    showProjectLocations,
    updateXAxisIndicator,
    updateSelectedRegions,
    updateShowProjectLocations,
  } = useContext(Context) as CtxDataType;

  const options = indicators.filter((d) => d.Map).map((d) => d.Indicator);
  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [options]);
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
      <DropdownEl>
        <DropdownTitle>
          Select a Region
        </DropdownTitle>
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder='Select a region'
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
      <CheckboxContainer>
        <CheckboxEl>
          <Checkbox checked={showProjectLocations} onChange={(e) => { updateShowProjectLocations(e.target.checked); }}>Show project locations</Checkbox>
        </CheckboxEl>
      </CheckboxContainer>
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
