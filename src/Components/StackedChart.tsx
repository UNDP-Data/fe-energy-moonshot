import { useEffect, useRef, useState } from 'react';
// @ts-ignore:next-line
import StackedBarChart from 'stacked-barchart';
import Label from './chartLabel';

interface Props {
  data: any;
  id: string;
  clickCallback: Funcion;
}

export default (props: Props) => {
  const { data, id, clickCallback } = props;
  const [dataArray, setDataArray] = useState([]);
  const [valuesSum, setValuesSum] = useState(0);
  const [tooltipShown, setTooltipShown] = useState(1);
  const chartRef = useRef(null);

  /*
  const [graph, setGraph] = useState();

     useEffect(() => {
    console.log('DATA', data);
    const graph = StackedBarChart(
      {
        data: [data],
      },
      {
        containerSelector: `#${id}`,
        width: document.getElementById(id)?.offsetWidth,
        height: 60,
        margin: { left: 0, top: 0, bottom: 0 },
      },
    );
    setGraph(graph);
    graph.on('nodeClick', event => {
      clickCallback(event.clickedNodeData.key);
    });
  }, [data]);
 */
  useEffect(() => {
    const array = Object.entries(data).map(([key, value]) => ({
      ...value,
      label: key,
    }));

    setDataArray(array);
    setValuesSum(array.reduce((acc, item) => acc + item.value, 0));
  }, [data]);

  return (
    <div id={id} className='undp-stacked-chart' ref={chartRef}>
      {!!dataArray.length &&
        dataArray.map(({ color, key, order, value, overlap, label }, index) => (
          <div
            key={key + value}
            className='undp-stacked-chart-element'
            style={{
              width: `calc(${
                valuesSum > 0 ? (value / valuesSum) * 100 : 0
              }% - ${order == 1 ? 0 : 2}px)`,
              order,
            }}
          >
            <div
              className='undp-stacked-chart-label'
              style={{ backgroundColor: color }}
              onMouseEnter={() => setTooltipShown(index)}
              onMouseLeave={() => setTooltipShown(-1)}
              onClick={() => {
                clickCallback(label);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  clickCallback(label);
                }
              }}
              role='button'
              tabIndex={0}
            >
              <Label
                /*  backgroundColor={color} */
                text={label}
                className='undp-stacked-chart-label-child'
              />
              {overlap > 0 && (
                <div
                  className='undp-stacked-chart-overlap'
                  style={{
                    backgroundColor: color,
                    width: `calc(${(overlap / value) * 100}% + 2px)`,
                  }}
                >
                  <div className='undp-stacked-chart-overlap-border' />
                </div>
              )}
              <div
                className='undp-stacked-chart-tooltip'
                style={{
                  borderColor: color,
                  opacity: tooltipShown === index ? 1 : 0,
                }}
              >
                <div className='undp-stacked-chart-tooltip-tick' />
                <span className='undp-stacked-chart-tooltip-title'>
                  {label}
                </span>
                <span className='undp-stacked-chart-tooltip-value'>
                  {`${Math.round(value / 100000000)}M`}
                </span>
              </div>
            </div>

            <Label
              text={`${Math.round(value / 100000000)}M`}
              className='undp-stacked-chart-value'
            />
          </div>
        ))}
    </div>
  );
};
