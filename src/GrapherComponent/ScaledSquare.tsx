import { scaleSqrt } from 'd3-scale';
import { select } from 'd3-selection';
import { format } from 'd3-format';
import { useEffect } from 'react';
import { CountryIndicatorDataType } from '../Types';

interface Props{
  values: CountryIndicatorDataType[];
  indicators: string[],
  maxValue: number,
}
export const ScaledSquare = (props:Props) => {
  const {
    values,
    indicators,
    maxValue,
  } = props;

  function filterIndicator(ind:string) {
    return values.filter((d) => d.indicator === ind)[0];
  }
  const width = 250;
  const squareWidth = 240;
  const scale = scaleSqrt<number>().range([0, squareWidth]).domain([0, maxValue]);
  const item2030 = filterIndicator(indicators[0]);
  const item2050 = filterIndicator(indicators[1]);

  useEffect(() => {
    select(`#${indicators[0]}`)
      .transition()
      .duration(2000)
      .attr('width', scale(Number(item2030.value)))
      .attr('height', scale(Number(item2030.value)));
  });
  return (
    <div>
      <svg width={width + scale(Number(item2030.value)) + 20} height={width}>
        <g transform='translate(0)'>
          <rect id={indicators[0]} height='0' width='0' style={{ fill: 'var(--blue-300)', opacity: 0.6 }} />
          <text x={scale(Number(item2030.value)) + 3} y='20'>{`${format(',')(item2030.value * 1000)}M (USD)`}</text>
        </g>

        <g transform={`translate(0,${scale(Number(item2030.value)) + 5})`}>
          <rect height={scale(Number(item2050.value))} width={scale(Number(item2050.value))} style={{ fill: 'var(--blue-600)' }} />
          <text x={scale(Number(item2050.value)) > 200 ? 3 : scale(Number(item2050.value)) + 3} y='20'>{`${format(',')(item2050.value * 1000)}M (USD)`}</text>
        </g>

      </svg>
    </div>
  );
};
