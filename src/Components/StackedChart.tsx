/* tslint:disable */
/* eslint-disable */

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
  const [dataArray, setDataArray] = useState<any[]>([]);
  const [valuesSum, setValuesSum] = useState(0);
  const [tooltipShown, setTooltipShown] = useState(-1);
  const [normalizedTooltips, setNormalizedTooltips] = useState<any>({});
  const [refresh, setRefresh] = useState(0);
  // To store measured widths of each chart element
  const [elementWidths, setElementWidths] = useState<number[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  // Create an array of refs for each chart element
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeoutId = useRef<any>(0)

  function formatBigNumber(num: number) {
    // If the number is less than 1000, just return it as a string
    if (num < 1e3) return num.toString();
  
    // Define the scales and their corresponding suffixes
    const scales = [
      { value: 1e9, suffix: "B" },
      { value: 1e6, suffix: "M" },
      { value: 1e3, suffix: "K" }
    ];
  
    // Loop over each scale
    for (let scale of scales) {
      if (num >= scale.value) {
        let quotient = num / scale.value;
        // Count digits in the integer part of quotient
        let intDigits = Math.floor(quotient).toString().length;
        // Determine factor for truncating to 3 significant digits
        let factor = Math.pow(10, Math.max(0, 3 - intDigits));
        let truncated = Math.floor(quotient * factor) / factor;
        return truncated + scale.suffix;
      }
    }
  }

  // After every render when dataArray changes, measure the widths of each chart element
  useEffect(() => {
    function checkWidth() {
      clearTimeout(timeoutId.current)
      if (elementRefs.current.length > 0) {
        const widths = elementRefs.current.map(el => (el ? el.offsetWidth : 0));
        setElementWidths(widths);
      }
    }
    timeoutId.current = setTimeout(() => {
      checkWidth()
    }, 500)

  }, [dataArray]);

  useEffect(() => {
    if (tooltips && data) {
      setNormalizedTooltips(
        Object.entries(tooltips).reduce(
          (accumulator: { [key: string]: any }, [key, value]) => {
            const lowerKey = key.toLowerCase();
            accumulator[lowerKey] = value;
            return accumulator;
          },
          {},
        ),
      );
    }
    setRefresh(prev => prev + 1);
  }, [tooltips, data]);

  useEffect(() => {
    if (data) {
      const array: any = Object.entries(data).map(([key, value]) => ({
        ...(typeof value === 'object' && value !== null ? value : {}),
        label: key,
      }));

      setDataArray(array);
      setValuesSum(array.reduce((acc: any, item: any) => acc + item.value, 0));
    }
  }, [data]);

  return (
    <>
      {data && (
        <div id={id} className='undp-stacked-chart' ref={chartRef}>
          {!!dataArray.length &&
            dataArray.map(
              (
                {
                  color,
                  key,
                  order,
                  value,
                  overlap,
                  label,
                }: {
                  color: string;
                  key: string;
                  order: number;
                  value: number;
                  overlap: number;
                  label: string;
                },
                index: number,
              ) => {
                // Assign a ref to each chart element so we can measure its width
                const setRef = (el: HTMLDivElement | null) => {
                  elementRefs.current[order - 1] = el;
                };

                // Compute main bar width percentage as rendered by CSS might not match the actual DOM measurement,
                // so we use the measured width (if available) to compute the overlap width in pixels.
                const currentWidth = elementWidths[order - 1] || 0;
                // Compute desired overlap width in pixels
                const desiredOverlapWidth = currentWidth
                  ? currentWidth * (overlap / value) + 2
                  : 0;
                // If there is a previous element, get its measured width
                const previousWidth =
                  order > 0 ? elementWidths[order - 2] || 0 : Infinity;
                // Cap the overlap width to the previous element's width
                const finalOverlapWidth = Math.min(
                  desiredOverlapWidth,
                  previousWidth,
                );

                const tooltipKey = useKey
                  ? key.toLowerCase()
                  : label.toLowerCase();

                /*      if (value == 0) return; */
                return (
                  <div
                    ref={setRef}
                    key={key /*  + refresh.toString() */}
                    className='undp-stacked-chart-element'
                    style={{
                      width:
                        value === 0
                          ? '0%'
                          : `calc(${
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
                        clickCallback(useKey ? key : label);
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
                        refresh={refresh}
                        text={useKey ? key : label}
                        className='undp-stacked-chart-label-child'
                      />
                      {overlap > 0 && (
                        <div
                          className='undp-stacked-chart-overlap'
                          style={{
                            backgroundColor: color,
                            // Use the computed pixel width (with 'px') for the overlap,
                            // ensuring it never exceeds the previous element's width.
                            width:
                              finalOverlapWidth > 0
                                ? `min(${finalOverlapWidth}px, calc(50% + 2px))`
                                : 0,
                            transition: `all 0.5s ease-in-out`,
                            borderLeft:
                              finalOverlapWidth > 0
                                ? `2px solid #fff`
                                : `2px solid transparent`,
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
                        {normalizedTooltips &&
                          normalizedTooltips[tooltipKey] && (
                            <span className='undp-stacked-chart-tooltip-description'>
                              {normalizedTooltips[tooltipKey].text}
                            </span>
                          )}
                        <span className='undp-stacked-chart-tooltip-value'>
                          {`${Math.round(value / 1000000)}M`}
                        </span>
                      </div>
                    </div>

                    <Label
                      text={`${formatBigNumber(value)}`}
                      className='undp-stacked-chart-value'
                    />
                  </div>
                );
              },
            )}
        </div>
      )}
    </>
  );
};
