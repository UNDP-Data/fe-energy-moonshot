/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import Context from '../Context/Context';
import {
  CtxDataType, DataType, IndicatorMetaDataType, ProjectCoordinateDataType,
} from '../Types';
import { UnivariateMap } from './UnivariateMap';
import { DEFAULT_VALUES } from '../Constants';

interface Props {
  data: DataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
}

const El = styled.div`
  width: 100%;
  overflow: auto;
  position: relative;
  background-color: var(--black-100);
  @media (min-width: 961px) {
    height: 74rem;
  }
  @media (max-width: 960px) {
    width: 100%;
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

const SettingEl = styled.div`
  padding: 2rem;
  background-color:rgba(255,255,255,0.6);
  box-shadow: var(--shadow);
  min-width: 32rem;
  width: calc(25% + 4rem);
  margin-top: 2rem;
  position: absolute;
  top: 4rem;
  left: 2rem;
  top: 0;
  z-index: 2;
`;

export const Graph = (props: Props) => {
  const {
    data,
    projectCoordinatesData,
    indicators,
  } = props;

  const {
    xAxisIndicator,
    updateXAxisIndicator,
    updateShowProjectLocations,
    showProjectLocations,
  } = useContext(Context) as CtxDataType;

  const options = indicators.map((d) => d.Indicator);
  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [options]);

  return (
    <El id='graph-node'>
      <SettingEl>
        <DropdownEl>
          <FilterTitle>
            Select Indicator
          </FilterTitle>
          <Select
            className='select-box'
            showSearch
            placeholder='Please select'
            value={xAxisIndicator}
            onChange={(d) => { updateXAxisIndicator(d); }}
            defaultValue={DEFAULT_VALUES.firstMetric}
          >
            {
              options.map((d) => (
                <Select.Option className='select-box-option' key={d}>{d}</Select.Option>
              ))
            }
          </Select>
        </DropdownEl>
        <div className='undp-checkbox-el' onClick={() => { updateShowProjectLocations(!showProjectLocations); }}>
          <div className={`undp-checkbox ${showProjectLocations ? 'undp-checkbox-checked' : 'undp-checkbox-unchecked'}`} />
          <div className='undp-checkbox-label'>Show project locations</div>
        </div>
      </SettingEl>
      <UnivariateMap
        data={data}
        projectCoordinatesData={projectCoordinatesData}
        indicators={indicators}
      />
    </El>
  );
};
