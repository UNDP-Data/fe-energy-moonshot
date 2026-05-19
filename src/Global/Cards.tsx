import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import sumBy from 'lodash.sumby';
import styled from 'styled-components';
import { format } from 'd3-format';
import { useTranslation } from 'react-i18next';
import { CtxDataType, DataType } from '../Types';
import Context from '../Context/Context';

interface WidthProps {
  $active?: boolean;
}

const StatCardsDiv = styled.div<WidthProps>`
  align-content: center;
  background-color: ${(props) => (props.$active ? 'var(--yellow-bg, #FFE17E)' : 'var(--white)')};
  box-sizing: border-box;
  color: ${(props) => (props.$active ? 'var(--black)' : 'inherit')};
  cursor: default;
  height: 100%;
  min-height: 5.2rem;
  min-width: 0;
  overflow: hidden;
  padding: 0.55rem 0.75rem 0.65rem;
  position: relative;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
  width: 100%;
  &:hover,
  &:focus-within {
    background-color: var(--yellow-bg, #FFE17E);
    color: var(--black);
  }
  h3.undp-typography {
    color: ${(props) => (props.$active ? 'var(--black)' : 'inherit')};
    display: block;
    font-feature-settings: 'tnum' 1;
    font-variant-numeric: tabular-nums;
    font-size: clamp(1.75rem, 3vw, 3rem);
    line-height: 0.95;
    margin-bottom: 0.25rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    -webkit-text-fill-color: ${(props) => (props.$active ? 'var(--black)' : 'transparent')};
    -webkit-text-stroke: ${(props) => (props.$active ? '0' : '1px var(--black)')};
  }
  &:hover h3.undp-typography,
  &:focus-within h3.undp-typography,
  &:hover p,
  &:focus-within p {
    color: var(--black);
  }
  &:hover h3.undp-typography,
  &:focus-within h3.undp-typography {
    -webkit-text-fill-color: var(--black);
    -webkit-text-stroke: 0;
  }
  p {
    color: ${(props) => (props.$active ? 'var(--black)' : 'inherit')};
    margin-bottom: 0;
    overflow-wrap: anywhere;
  }
`;

const StatCardsGrid = styled.div`
  align-items: stretch;
  box-sizing: border-box;
  display: grid;
  gap: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  height: 100%;
  margin-bottom: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

interface Props {
  data: DataType[];
}

const ANIMATION_DURATION = 450;

const getCompactScale = (targetValue: number) => {
  const absTarget = Math.abs(targetValue);
  if (absTarget >= 1_000_000_000) return { divisor: 1_000_000_000, suffix: 'B' };
  if (absTarget >= 1_000_000) return { divisor: 1_000_000, suffix: 'M' };
  if (absTarget >= 10_000) return { divisor: 1_000, suffix: 'k' };
  return { divisor: 1, suffix: '' };
};

const getCompactDecimals = (targetValue: number, divisor: number) => {
  if (divisor === 1) return 0;
  const scaledTarget = Math.abs(targetValue) / divisor;
  if (scaledTarget < 10) return 2;
  if (scaledTarget < 100) return 1;
  return 0;
};

const formatData = (d: undefined | number, targetValue = d) => {
  if (d === undefined || targetValue === undefined) return undefined;
  if (Math.abs(targetValue) < 10000) {
    return format(',')(parseFloat(d.toFixed(0))).replace(/,/g, ' ');
  }
  const { divisor, suffix } = getCompactScale(targetValue);
  const decimals = getCompactDecimals(targetValue, divisor);
  const scaledValue = d / divisor;
  return `${scaledValue.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })}${suffix}`;
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const useAnimatedNumber = (targetValue: undefined | number) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const displayValueRef = useRef(targetValue);
  const frameRef = useRef<number | undefined>(undefined);
  const hasMountedRef = useRef(false);
  const animationRunRef = useRef(0);

  useEffect(() => {
    animationRunRef.current += 1;
    const animationRun = animationRunRef.current;

    if (frameRef.current !== undefined) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }

    if (targetValue === undefined || !Number.isFinite(targetValue)) {
      displayValueRef.current = targetValue;
      setDisplayValue(targetValue);
      hasMountedRef.current = true;
      return undefined;
    }

    if (!hasMountedRef.current || prefersReducedMotion()) {
      displayValueRef.current = targetValue;
      setDisplayValue(targetValue);
      hasMountedRef.current = true;
      return undefined;
    }

    const startValue = typeof displayValueRef.current === 'number'
      && Number.isFinite(displayValueRef.current)
      ? displayValueRef.current
      : 0;
    const delta = targetValue - startValue;
    if (Math.abs(delta) < 0.5) {
      displayValueRef.current = targetValue;
      setDisplayValue(targetValue);
      return undefined;
    }

    const startTime = window.performance.now();

    const tick = (timestamp: number) => {
      if (animationRun !== animationRunRef.current) return;
      const progress = Math.min((timestamp - startTime) / ANIMATION_DURATION, 1);
      const nextValue = startValue + delta * easeOutCubic(progress);
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        frameRef.current = undefined;
        displayValueRef.current = targetValue;
        setDisplayValue(targetValue);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [targetValue]);

  return displayValue;
};

const AnimatedMetric = ({
  value,
  notAvailable,
}: {
  value: undefined | number;
  notAvailable: string;
}) => {
  const displayValue = useAnimatedNumber(value);
  const targetLabel = value === undefined ? notAvailable : formatData(value, value);
  const displayLabel = displayValue === undefined ? notAvailable : formatData(displayValue, value);
  return (
    <h3
      className='undp-typography'
      style={{ minWidth: `${targetLabel.length}ch` }}
    >
      {displayLabel}
    </h3>
  );
};

export const Cards = (props: Props) => {
  const {
    data,
  } = props;
  const {
    filters,
  } = useContext(Context) as CtxDataType;
  const selectedCategory = filters.category;
  //
  // const relevantData = selectedCountries.length > 0
  //   ? data.filter((d) => d['Country or Area'] === selectedCountries)
  //   : selectedRegions !== 'All'
  //     ? data.filter((d) => d.region === selectedRegions) : data;
  const sumIndicator = (indicatorKey: string) => sumBy(data, (d:any) => {
    const indicator = d.indicators.find((i:any) => i.indicator === indicatorKey);
    return indicator?.value || 0;
  });

  const cardData = {
    numberProjects: sumIndicator('nProj'),
    peopleBenefiting: sumIndicator('directBeneficiaries'),
    grantAmount: sumIndicator('budget'),
    policies: sumIndicator('policies'),
    mwAdded: sumIndicator('mwAdded'),
    numberCountries: data.filter((d) => d['Alpha-3 code'] && d['Alpha-3 code'] !== '' && d['Alpha-3 code'] !== null && d['Alpha-3 code'] !== undefined).length,
  };
  // translation
  const { t } = useTranslation();
  const notAvailable = t('not-available');
  const [hoveredKpi, setHoveredKpi] = useState<string | undefined>(undefined);
  const firstKpiKey = selectedCategory === 'Policy'
    ? 'number-of-policies'
    : selectedCategory === 'Energy Transition'
      ? 'mw-added'
      : 'people-benefiting';
  const defaultKpiKey = firstKpiKey;

  const getKpiHighlightProps = (key: string) => ({
    $active: hoveredKpi ? hoveredKpi === key : key === defaultKpiKey,
    onFocus: () => setHoveredKpi(key),
    onMouseEnter: () => setHoveredKpi(key),
    onBlur: () => setHoveredKpi(undefined),
    onMouseLeave: () => setHoveredKpi(undefined),
  });

  return (
    <>
      <StatCardsGrid>
        {
          selectedCategory && (
            <StatCardsDiv
              {...getKpiHighlightProps(firstKpiKey)}
            >
              {
                (selectedCategory === 'Energy Transition') && (
                  <>
                    <AnimatedMetric value={cardData.mwAdded} notAvailable={notAvailable} />
                    <p>{t('mw-added')}</p>
                  </>
                )
              }
              {
                (selectedCategory === 'Energy Access') && (
                  <>
                    <AnimatedMetric value={cardData.peopleBenefiting} notAvailable={notAvailable} />
                    <p>{t('people-benefiting')}</p>
                  </>
                )
              }
              {
                (
                  selectedCategory === 'Policy') && (
                  <>
                    <AnimatedMetric value={!cardData.policies ? undefined : cardData.policies} notAvailable={notAvailable} />
                    <p>{t('number-of-policies')}</p>
                  </>
                )
              }
              {
                (selectedCategory === 'Market Development') && (
                  <>
                    <h3 className='undp-typography'>
                      {notAvailable}
                    </h3>
                  </>
                )
              }
              {
                (selectedCategory === 'all') && (
                  ((cardData.peopleBenefiting) && (
                    <>
                      <AnimatedMetric value={cardData.peopleBenefiting} notAvailable={notAvailable} />
                      <p>{t('people-benefiting')}</p>
                    </>
                  ))
                  || (
                    <>
                      <h3 className='undp-typography'>
                        {notAvailable}
                      </h3>
                    </>
                  )
                )
              }
            </StatCardsDiv>
          )
        }
        <StatCardsDiv
          {...getKpiHighlightProps('number-projects')}
        >
          <AnimatedMetric value={cardData.numberProjects} notAvailable={notAvailable} />
          <p>{t('number-projects')}</p>
        </StatCardsDiv>
        <StatCardsDiv
          {...getKpiHighlightProps('number-countries')}
        >
          <AnimatedMetric value={cardData.numberCountries} notAvailable={notAvailable} />
          <p>{t('number-countries')}</p>
        </StatCardsDiv>
        <StatCardsDiv
          {...getKpiHighlightProps('total-grant-usd')}
        >
          <AnimatedMetric value={cardData.grantAmount} notAvailable={notAvailable} />
          <p>{t('total-grant-usd')}</p>
        </StatCardsDiv>
      </StatCardsGrid>
    </>
  );
};
