import { useEffect, useRef, useState } from 'react';
import Label from './chartLabel';

interface Props {
  data: any;
  id: string;
  clickCallback: Function;
  tooltips?: any;
  useKey?: boolean;
}

export default (props: Props) => {
  const { data, id, clickCallback, tooltips, useKey } = props;
  const [dataArray, setDataArray] = useState([]);
  const [valuesSum, setValuesSum] = useState(0);
  const [tooltipShown, setTooltipShown] = useState(-1);
  const [normalizedTooltips, setNormalizedTooltips] = useState<any>({});
  const chartRef = useRef(null);

  useEffect(() => {
    if (tooltips) {
      setNormalizedTooltips(
        Object.entries(tooltips).reduce((accumulator, [key, value]) => {
          const lowerKey = key.toLowerCase();
          accumulator[lowerKey] = value;
          return accumulator;
        }, {}),
      );
    }
  }, [tooltips]);

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
        dataArray.map(({ color, key, order, value, overlap, label }, index) => {
          const tooltipKey = useKey ? key.toLowerCase() : label.toLowerCase();
          return (
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
                    {normalizedTooltips && normalizedTooltips[tooltipKey]
                      ? normalizedTooltips[tooltipKey].header
                      : label}
                  </span>
                  {normalizedTooltips && normalizedTooltips[tooltipKey] && (
                    <span className='undp-stacked-chart-tooltip-description'>
                      {normalizedTooltips[tooltipKey].text}
                    </span>
                  )}
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
          );
        })}
    </div>
  );
};
