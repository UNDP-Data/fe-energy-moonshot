import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Label from './chartLabel';

interface Props {
  data: Record<string, any>;
  id: string;
  clickCallback: (value: string) => void;
  tooltips?: Record<string, { header?: string; text?: string }>;
  useKey?: boolean;
}

const StackedChart = (props: Props) => {
  const { data, id, clickCallback, tooltips, useKey } = props;
  const [tooltipShown, setTooltipShown] = useState(-1);
  const [elementWidths, setElementWidths] = useState<number[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const normalizedTooltips = useMemo(() => {
    if (!tooltips || !data) {
      return {};
    }

    return Object.entries(tooltips).reduce(
      (accumulator: Record<string, { header?: string; text?: string }>, [key, value]) => {
        const lowerKey = key.toLowerCase();
        accumulator[lowerKey] = value;
        return accumulator;
      },
      {},
    );
  }, [data, tooltips]);

  const dataArray = useMemo(() => (
    Object.entries(data || {}).map(([key, value]) => ({
      ...(typeof value === 'object' && value !== null ? value : {}),
      label: key,
    }))
  ), [data]);

  const valuesSum = useMemo(
    () => dataArray.reduce((acc, item) => acc + item.value, 0),
    [dataArray],
  );

  function formatCompactNumber(num: number) {
    if (!Number.isFinite(num)) return '0';

    const absoluteValue = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absoluteValue < 1000) {
      return `${sign}${absoluteValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
    }

    const scales = [
      { value: 1e9, suffix: 'b' },
      { value: 1e6, suffix: 'm' },
      { value: 1e3, suffix: 'k' },
    ];

    const scale = scales.find((item) => absoluteValue >= item.value);
    if (!scale) return `${num}`;

    const scaledValue = absoluteValue / scale.value;
    const formattedValue = scaledValue.toLocaleString(undefined, {
      maximumFractionDigits: scaledValue >= 100 ? 0 : 1,
      minimumFractionDigits: 0,
    });

    return `${sign}${formattedValue}${scale.suffix}`;
  }

  const measureWidths = useCallback(() => {
    if (!elementRefs.current.length) return;

    const widths = elementRefs.current.map((el) => (el ? el.offsetWidth : 0));
    setElementWidths((currentWidths) => {
      if (
        currentWidths.length === widths.length
        && currentWidths.every((width, index) => width === widths[index])
      ) {
        return currentWidths;
      }

      return widths;
    });
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(measureWidths);
    let resizeObserver: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined' && chartRef.current) {
      resizeObserver = new ResizeObserver(measureWidths);
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [dataArray, measureWidths]);

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
                          : `calc(${valuesSum > 0 ? (value / valuesSum) * 100 : 0
                          }% - ${order === 1 ? 0 : 2}px)`,
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          clickCallback(useKey ? key : label);
                        }
                      }}
                      role='button'
                      tabIndex={0}
                    >
                      <Label
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
                            transition: 'all 0.5s ease-in-out',
                            borderLeft:
                              finalOverlapWidth > 0
                                ? '2px solid #fff'
                                : '2px solid transparent',
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
                          {formatCompactNumber(value)}
                        </span>
                      </div>
                    </div>

                    <Label
                      text={`${formatCompactNumber(value)}`}
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

export default StackedChart;
