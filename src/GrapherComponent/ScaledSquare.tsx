import { scaleSqrt } from 'd3-scale';
import { format } from 'd3-format';
import { CountryIndicatorDataType } from '../Types';

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
interface Props{
  values: CountryIndicatorDataType[];
  indicators: string[],
  indicators2: string[],
  maxValue: number,
  unit: string,
  scaleChart: boolean,
  factor: number,
  invert: boolean,
}

const numberColor = (value:any) => {
  if (value > 90) return '#FFF';
  return '#000';
};

export const ScaledSquare = (props:Props) => {
  const {
    values,
    indicators,
    indicators2,
    maxValue,
    unit,
    scaleChart,
    factor,
    invert,
  } = props;

  function filterIndicator(ind:string) {
    return values.filter((d) => d.indicator === ind)[0];
  }
  const negValue = (value:any) => {
    if ((invert && (value > 0)) || (!invert && (value < 0))) return true;
    return false;
  };

  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;
    let value: number;

    if (invert) {
      value = d * -1;
    } else value = d;
    if (value < 1000000) return format(',')(value).replaceAll(',', ' ');
    return format('.3s')(value).replace('G', 'B').replaceAll(',', ' ');
    // return `${format(',')(Math.round(value / 1000000))}M`;
  };

  const width = 230;
  const squareWidth = 240;
  const scale = scaleSqrt<number>().range([0, squareWidth]).domain([0, maxValue]);
  const value2030 = Number(filterIndicator(indicators[0]).value);
  const value2050 = Number(filterIndicator(indicators[1]).value);
  const vScale = scaleChart ? 275 / (Math.abs(scale(value2030)) + Math.abs(scale(value2050))) : 1;
  const square2030Size = scale(Math.abs(value2030)) * vScale;
  const square2050Size = scale(Math.abs(value2050)) * vScale;

  return (
    <div>
      <svg width={width + 20} height={278}>
        <g transform={`translate(0) scale(${1})`}>
          <g transform='translate(0)'>
            <rect id={indicators[0]} height={square2030Size} width={square2030Size} style={{ fill: 'var(--blue-300)', stroke: negValue(value2030) ? 'var(--dark-red)' : '', strokeWidth: negValue(value2030) ? '2' : '0' }} x={negValue(value2030) ? 1 : 0} y={negValue(value2030) ? 1 : 0} />
            <text x={square2030Size > 90 ? 5 : square2030Size + 5} y='20' style={{ fill: numberColor(square2030Size), fontSize: '.9rem', fontWeight: 'bold' }}>{`${unit}${formatData(value2030 * factor)} ${(indicators2.length > 0) ? `(${indicators2[0]})` : ''}`}</text>
          </g>

          <g transform={`translate(0,${square2030Size + 5})`}>
            <rect height={square2050Size} width={square2050Size} style={{ fill: 'var(--blue-600)', stroke: negValue(value2050) ? 'var(--dark-red)' : '', strokeWidth: negValue(value2050) ? '1' : '0' }} />
            <text className='squareLabel' x={square2050Size > 90 ? 5 : square2050Size + 5} y='20' style={{ fill: numberColor(square2050Size), fontSize: '.9rem', fontWeight: 'bold' }}>
              {`${unit}${formatData(value2050 * factor)} ${(indicators2.length > 0) ? `(${indicators2[1]})` : ''}`}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
