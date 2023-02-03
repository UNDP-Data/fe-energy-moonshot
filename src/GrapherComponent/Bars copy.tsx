import { scaleLinear } from 'd3-scale';
import { useEffect } from 'react';
import { CountryIndicatorDataType } from '../Types';

interface Props{
  values: CountryIndicatorDataType[];
  indicator: string,
}
export const Bars = (props:Props) => {
  const {
    values,
    indicator,
  } = props;

  const scale = scaleLinear<number>().range([0, 300]).domain([0, 100]);
  const width = 400;
  const height = 200;
  const ruralPercent = 70;
  const urbanPercent = 50;
  const totalPercent = 60;
  const yearValue = 2020;
  function filterIndicator(ind, location, unit) {
    return values.filter((d) => d.indicator === `${ind}_${unit}${location}`)[0];
  }
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(values, indicator, filterIndicator(indicator, 'u', 'share'));
  });
  // filterIndicator(indicator, 'u', 'share').value

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform='translate(60,30)'>
        <g transform='translate(0,50)'>
          <rect height='30' width={scale(100)} style={{ fill: '#FFF', stroke: '#D4D6D8', strokeWidth: 0.5 }} />
          <rect height='30' width={scale(urbanPercent)} style={{ fill: '#55606E' }} />
          <text x='-5' y='20' textAnchor='end'>Urban</text>
          <text x={scale(urbanPercent) + 5} y='22'>{`${urbanPercent}%`}</text>
        </g>
        <g transform='translate(0,85)'>
          <rect height='30' width={scale(100)} style={{ fill: '#FFF', stroke: '#D4D6D8', strokeWidth: 0.5 }} />
          <rect height='30' width={scale(ruralPercent)} style={{ fill: '#55606E' }} />
          <text x='-5' y='20' textAnchor='end'>Rural</text>
          <text x={scale(ruralPercent) + 5} y='22'>{`${ruralPercent}%`}</text>
        </g>
        <line style={{ stroke: '#333' }} strokeDasharray='2,2' x1={scale(totalPercent)} x2={scale(totalPercent)} y1='0' y2='125' />
        <text x={scale(totalPercent) - 5} y='20' textAnchor='end'>Total</text>
        <text x={scale(totalPercent) + 5} y='20'>{`${totalPercent}%`}</text>
        <text y='150'>{`Year: ${yearValue}`}</text>
      </g>
    </svg>
  );
};
