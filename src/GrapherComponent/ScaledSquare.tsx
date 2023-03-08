import { scaleSqrt } from 'd3-scale';
import { format } from 'd3-format';
import { CountryIndicatorDataType } from '../Types';

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
interface Props{
  values: CountryIndicatorDataType[];
  indicators: string[],
  maxValue: number,
  unit: string,
  scaleChart: boolean,
  factor: number,
}
const formatData = (d: undefined | number) => {
  if (d === undefined) return d;

  if (d < 1000000) return format(',')(d);
  return `${format(',')(Math.round(d / 1000000))}M`;
};
const numberColor = (value:any) => {
  console.log('value', value);
  if (value > 90) return '#FFF';
  return '#000';
};

export const ScaledSquare = (props:Props) => {
  const {
    values,
    indicators,
    maxValue,
    unit,
    scaleChart,
    factor,
  } = props;

  function filterIndicator(ind:string) {
    return values.filter((d) => d.indicator === ind)[0];
  }

  const width = 250;
  const squareWidth = 240;
  const scale = scaleSqrt<number>().range([0, squareWidth]).domain([0, maxValue]);
  const value2030 = Number(filterIndicator(indicators[0]).value);
  const value2050 = Number(filterIndicator(indicators[1]).value);
  const vScale = scaleChart ? 275 / (scale(value2030) + scale(value2050)) : 1;

  return (
    <div>
      <svg width={width + 20} height={278}>
        <g transform={`translate(0) scale(${1})`}>
          <g transform='translate(0)'>
            <rect id={indicators[0]} height={scale(value2030) * vScale} width={scale(value2030) * vScale} style={{ fill: 'var(--blue-300)' }} />
            <text x={scale(value2030) * vScale > 90 ? 5 : scale(value2030) * vScale + 5} y='20' style={{ fill: numberColor(scale(value2030) * vScale), fontSize: '.9rem', fontWeight: 'bold' }}>{`${formatData(Math.abs(value2030 * factor))}${unit}`}</text>
          </g>

          <g transform={`translate(0,${scale(value2030) * vScale + 5})`}>
            <rect height={scale(value2050) * vScale} width={scale(value2050) * vScale} style={{ fill: 'var(--blue-600)' }} />
            <text className='squareLabel' x={scale(value2050) * vScale > 90 ? 5 : scale(value2050) * vScale + 5} y='20' style={{ fill: numberColor(scale(value2050) * vScale), fontSize: '.9rem', fontWeight: 'bold' }}>{`${formatData(Math.abs(value2050 * factor))}${unit}`}</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
