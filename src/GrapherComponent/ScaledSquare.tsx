import { scaleSqrt } from 'd3-scale';
import { CountryIndicatorDataType } from '../Types';

interface Props{
  values: CountryIndicatorDataType[];
  year: string,
  indicator: string,
  maxValue: number,
}
export const ScaledSquare = (props:Props) => {
  const {
    values,
    year,
    indicator,
    maxValue,
  } = props;

  function filterIndicator(ind:string) {
    return values.filter((d) => d.indicator === ind)[0];
  }

  const width = 250;
  const squareWidth = 240;
  const scale = scaleSqrt<number>().range([0, squareWidth]).domain([0, maxValue]);
  const item = filterIndicator(`${indicator}${year}_bi`);
  const item2050 = filterIndicator(`${indicator}2050_bi`);

  // eslint-disable-next-line no-console
  console.log('year, item', year, item);
  return (
    <div>
      <p className='undp-typography'>{`${item.value}M (USD)`}</p>
      <svg width={width} height={width}>
        <g transform='translate(00)'>
          <rect height={scale(Number(item.value))} width={scale(Number(item.value))} style={{ fill: '#55606E' }} />
          <rect height={scale(Number(item2050.value))} width={scale(Number(item2050.value))} style={{ fill: 'none', stroke: '#FFF' }} />
        </g>
      </svg>
    </div>
  );
};
