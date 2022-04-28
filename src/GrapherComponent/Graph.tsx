import {
  useContext, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import intersection from 'lodash.intersection';
import { CtxDataType, DataType, IndicatorMetaDataWithYear } from '../Types';
import Context from '../Context/Context';
import { UnivariateMap } from './UnivariateMap';

interface Props {
  data: DataType[];
  indicators: IndicatorMetaDataWithYear[];
  fullWidth: boolean;
}

interface ElProps {
  fullWidth: boolean;
}

const El = styled.div<ElProps>`
  width: ${(props) => (props.fullWidth ? '100%' : '75%')};
  box-shadow: var(--shadow-right);
  overflow: auto;
  @media (min-width: 961px) {
    height: 74rem;
  }
  @media (max-width: 960px) {
    width: 100%;
  }
`;

export const Graph = (props: Props) => {
  const {
    data,
    indicators,
    fullWidth,
  } = props;
  const {
    graphType,
    xAxisIndicator,
    yAxisIndicator,
    sizeIndicator,
    updateYear,
  } = useContext(Context) as CtxDataType;
  const [commonYears, setCommonYears] = useState<number[]>([]);
  const [play, setPlay] = useState(false);
  const [yearForPlay, setYearForPlay] = useState<undefined | number>(undefined);
  // eslint-disable-next-line no-undef
  const timer: { current: NodeJS.Timeout | null } = useRef(null);

  useEffect(() => {
    setPlay(false);
    if (graphType !== 'barGraph') {
      if (yAxisIndicator) {
        if (!sizeIndicator) {
          const intersectedYears = intersection(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years, indicators[indicators.findIndex((d) => d.IndicatorLabelTable === yAxisIndicator)].years);
          setCommonYears(intersectedYears);
          updateYear(intersectedYears.length === 0 ? -1 : intersectedYears[intersectedYears.length - 1]);
          setYearForPlay(intersectedYears.length === 0 ? undefined : intersectedYears[intersectedYears.length - 1]);
        } else {
          const intersectedYears = intersection(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years,
            indicators[indicators.findIndex((d) => d.IndicatorLabelTable === yAxisIndicator)].years,
            indicators[indicators.findIndex((d) => d.IndicatorLabelTable === sizeIndicator)].years);
          setCommonYears(intersectedYears);
          updateYear(intersectedYears.length === 0 ? -1 : intersectedYears[intersectedYears.length - 1]);
          setYearForPlay(intersectedYears.length === 0 ? undefined : intersectedYears[intersectedYears.length - 1]);
        }
      } else if (!sizeIndicator) {
        setCommonYears(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years);
        updateYear(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years[indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years.length - 1]);
        setYearForPlay(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years[indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years.length - 1]);
      } else {
        const intersectedYears = intersection(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years, indicators[indicators.findIndex((d) => d.IndicatorLabelTable === sizeIndicator)].years);
        setCommonYears(intersectedYears);
        updateYear(intersectedYears.length === 0 ? -1 : intersectedYears[intersectedYears.length - 1]);
        setYearForPlay(intersectedYears.length === 0 ? undefined : intersectedYears[intersectedYears.length - 1]);
      }
    } else {
      setCommonYears(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years);
      updateYear(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years[indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years.length - 1]);
      setYearForPlay(indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years[indicators[indicators.findIndex((d) => d.IndicatorLabelTable === xAxisIndicator)].years.length - 1]);
    }
  }, [xAxisIndicator, yAxisIndicator, sizeIndicator, graphType]);
  useEffect(() => {
    if (play && yearForPlay) {
      timer.current = setInterval(() => {
        setYearForPlay((prevCounter) => (prevCounter ? commonYears.indexOf(prevCounter) === commonYears.length - 1 ? commonYears[0] : commonYears[commonYears.indexOf(prevCounter) + 1] : commonYears[0]));
      }, 1000);
    }
    if (!play && timer.current) clearInterval(timer.current);
  }, [play, commonYears]);
  useEffect(() => {
    if (yearForPlay !== undefined) { updateYear(yearForPlay as number); }
  }, [yearForPlay]);
  return (
    <El id='graph-node' fullWidth={fullWidth}>
      <UnivariateMap
        data={data}
        indicators={indicators}
      />
    </El>
  );
};
