import { scaleSqrt } from 'd3-scale';
import { select } from 'd3-selection';
import { useEffect } from 'react';
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

  useEffect(() => {
    select(`#${indicator}${year}_bi`)
      .transition()
      .duration(2000)
      .attr('width', scale(Number(item.value)))
      .attr('height', scale(Number(item.value)));
  });
  return (
    <div>
      <svg width={width} height={width}>
        <g transform='translate(00)'>
          <rect height={scale(Number(item2050.value))} width={scale(Number(item2050.value))} style={{ fill: '#D4D6D8', opacity: 0.6 }} />
          <rect id={`${indicator}${year}_bi`} height='0' width='0' style={{ fill: 'var(--blue-600)' }} />
        </g>
      </svg>
      <h6 className='undp-typography'>{`${item.value}M (USD)`}</h6>
    </div>
  );
};
