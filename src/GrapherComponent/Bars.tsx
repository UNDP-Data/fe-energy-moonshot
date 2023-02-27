import { scaleLinear } from 'd3-scale';
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

  function filterIndicator(ind:string, location:string, unit:string) {
    return values.filter((d) => d.indicator === `${ind}_${unit}${location}`)[0];
  }

  const width = 400;
  const height = 200;
  const barWidth = 240;
  const scale = scaleLinear<number>().range([0, barWidth]).domain([0, 100]);
  const urbanPercent = filterIndicator(indicator, 'u', 'share');
  const ruralPercent = filterIndicator(indicator, 'r', 'share');
  const totalPercent = filterIndicator(indicator, 't', 'share');

  // eslint-disable-next-line no-console
  // console.log(values, indicator, filterIndicator(indicator, 'u', 'share'));
  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <g transform='translate(60,30)'>
        <g transform='translate(0,50)'>
          <rect height='30' width={scale(100)} style={{ fill: '#FFF', stroke: '#D4D6D8', strokeWidth: 0.5 }} />
          <rect height='30' width={scale(Number(urbanPercent.value))} style={{ fill: '#55606E' }} />
          <text x='-5' y='20' textAnchor='end'>Urban</text>
          <text x={barWidth + 5} y='22'>{`${urbanPercent.value}%`}</text>
        </g>
        <g transform='translate(0,85)'>
          <rect height='30' width={scale(100)} style={{ fill: '#FFF', stroke: '#D4D6D8', strokeWidth: 0.5 }} />
          <rect height='30' width={scale(Number(ruralPercent.value))} style={{ fill: '#55606E' }} />
          <text x='-5' y='20' textAnchor='end'>Rural</text>
          <text x={barWidth + 5} y='22'>{`${ruralPercent.value}%`}</text>
        </g>
        <line style={{ stroke: '#333' }} strokeDasharray='2,2' x1={scale(totalPercent.value)} x2={scale(totalPercent.value)} y1='0' y2='125' />
        <text x={scale(totalPercent.value) - 5} y='20' textAnchor='end'>Total</text>
        <text x={scale(totalPercent.value) + 5} y='20'>{`${totalPercent.value}%`}</text>
        <text y='150'>{`Year: ${totalPercent.year}`}</text>
      </g>
    </svg>
  );
};
