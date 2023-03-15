import { scaleSqrt } from 'd3-scale';
import { format } from 'd3-format';
import { arc } from 'd3-shape';
import { CountryIndicatorDataType } from '../Types';

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
interface Props{
  values: CountryIndicatorDataType[];
  indicators: string[],
  indicators2: string[],
  maxValue: number,
  unit: string,
  factor: number,
  invert: boolean,
}

const numberColor = (value:any) => {
  if (value > 90) return '#FFF';
  return '#000';
};

const semiArcLeft = (value: number) => arc()({
  innerRadius: 0,
  outerRadius: value,
  startAngle: -Math.PI,
  endAngle: 0,
});

const semiArcRight = (value: number) => arc()({
  innerRadius: 0,
  outerRadius: value,
  startAngle: 0,
  endAngle: Math.PI,
});

export const ScaledHalfCircles = (props:Props) => {
  const {
    values,
    indicators,
    indicators2,
    maxValue,
    unit,
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
  };
  const width = 230;
  const maxRadius = width / 2 - 10;
  const scale = scaleSqrt<number>().range([0, maxRadius]).domain([0, maxValue]);
  const value2030 = Number(filterIndicator(indicators[0]).value * factor);
  const value2050 = Number(filterIndicator(indicators[1]).value * factor);
  const square2030Radius = scale(Math.abs(value2030));
  const square2050Radius = scale(Math.abs(value2050));

  return (
    <div>
      <svg width={width + 5} height={278}>
        <g transform={`translate(${maxRadius},130)`}>
          <g transform='translate(0)'>
            <path d={`${semiArcLeft(square2030Radius)}`} style={{ fill: 'var(--blue-300)', stroke: negValue(value2030) ? 'var(--dark-red)' : '', strokeWidth: negValue(value2030) ? '2' : '0' }} x={negValue(value2030) ? 1 : 0} y={negValue(value2030) ? 1 : 0} />
            <text
              x={square2030Radius > 90 ? -5 : -(square2030Radius + 5)}
              y='5'
              style={{
                fill: numberColor(square2030Radius),
                fontSize: '.9rem',
                fontWeight: 'bold',
                textAnchor: 'end',
              }}
            >
              {`${unit}${formatData(value2030)}`}
            </text>
            <text
              x={square2030Radius > 90 ? -5 : -(square2030Radius + 5)}
              y='25'
              style={{
                fill: numberColor(square2030Radius),
                fontSize: '.9rem',
                fontWeight: 'bold',
                textAnchor: 'end',
              }}
            >
              {` ${(indicators2.length > 0) ? `(${indicators2[0]})` : ''}`}
            </text>
          </g>

          <g transform='translate(3)'>
            <path d={`${semiArcRight(square2050Radius)}`} style={{ fill: 'var(--blue-600)', stroke: negValue(value2050) ? 'var(--dark-red)' : '', strokeWidth: negValue(value2050) ? '1' : '0' }} />
            <text
              x={square2050Radius > 90 ? 5 : square2050Radius + 5}
              y='5'
              style={{
                fill: numberColor(square2050Radius),
                fontSize: '.9rem',
                fontWeight: 'bold',
              }}
            >
              {`${unit}${formatData(value2050)}`}
            </text>
            <text
              x={square2050Radius > 90 ? 5 : square2050Radius + 5}
              y='25'
              style={{
                fill: numberColor(square2050Radius),
                fontSize: '.9rem',
                fontWeight: 'bold',
              }}
            >
              {`${(indicators2.length > 0) ? `(${indicators2[1]})` : ''}`}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
