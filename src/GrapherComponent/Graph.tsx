/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Checkbox, Select } from 'antd';
import Context from '../Context/Context';
import {
  CtxDataType, DataType, IndicatorMetaDataType, ProjectCoordinateDataType, ProjectCoordsDataType,
} from '../Types';
import { UnivariateMap } from './UnivariateMap';
import { DEFAULT_VALUES } from '../Constants';

interface Props {
  data: DataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
  projectCoordsData: ProjectCoordsDataType[];
}

const El = styled.div`
  width: 100%;
  overflow: auto;
  position: relative;
  background-color: var(--black-100);
  @media (min-width: 961px) {
    height: 740px;
  }
  @media (max-width: 960px) {
    width: 100%;
  }
`;

const SettingEl = styled.div`
  width: calc(100% - 2.5rem);
  padding:1.25rem;
  margin-top:1.25rem;
  margin-left:1.25rem;
  background-color:rgba(255,255,255,0.6);
  @media (min-width: 820px) {
    background-color:rgba(255,255,255,0.6);
    box-shadow: var(--shadow);
    min-width: 340px;
    width: calc(25% + 2.5rem);
    margin-top: 1.25rem;
    margin-left: 0;
    position: absolute;
    top: 2.5rem;
    left: 1.25rem;
    top: 0;
    z-index: 2;
  }
`;

export const Graph = (props: Props) => {
  const {
    data,
    projectCoordinatesData,
    indicators,
    projectCoordsData,
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
        <div className='margin-bottom-05' style={{ width: '100%', minWidth: '19rem' }}>
          <p className='label'>Select Indicator</p>
          <Select
            className='undp-select'
            placeholder='Please select'
            value={xAxisIndicator}
            onChange={(d) => { updateXAxisIndicator(d); }}
            defaultValue={DEFAULT_VALUES.firstMetric}
          >
            {
              options.map((d) => (
                <Select.Option className='undp-select-option' key={d}>{d}</Select.Option>
              ))
            }
          </Select>
        </div>
        <Checkbox className='undp-checkbox' checked={showProjectLocations} onClick={() => { updateShowProjectLocations(!showProjectLocations); }}>Show project locations</Checkbox>
      </SettingEl>
      <UnivariateMap
        data={data}
        projectCoordinatesData={projectCoordinatesData}
        indicators={indicators}
        projectCoordsData={projectCoordsData}
      />
    </El>
  );
};
