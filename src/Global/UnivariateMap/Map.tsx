import {
  useCallback, useContext, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { easeCubicOut } from 'd3-ease';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { ZoomTransform, zoom, zoomIdentity } from 'd3-zoom';
import { format } from 'd3-format';
import { select } from 'd3-selection';
import { Select } from 'antd';
import { scaleThreshold } from 'd3-scale';
import { useTranslation } from 'react-i18next';
import UNDPColorModule from 'undp-viz-colors';
import { Download } from 'lucide-react';
import {
  CtxDataType,
  DashboardFilterKey,
  DashboardFilters,
  DataType,
  HoverDataType,
  IndicatorMetaDataType,
  IndicatorRange,
} from '../../Types';
import Context from '../../Context/Context';
import { COLOR_SCALES, DEFAULT_VALUES } from '../../Constants';
import { Tooltip } from '../../Components/Tooltip';

interface Props {
  data: DataType[];
  geojsonMapData: any[];
  indicators: IndicatorMetaDataType[];
  availableCountryList: string[];
  binningRangeLarge: IndicatorRange;
}

const LegendEl = styled.div`
  position: relative;
  right: 10px;
  padding: 0.5rem 0.5rem 0 0.5rem;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: var(--shadow);
  width: 360px;
  margin-left: 1rem;
  margin-top: -1rem;
  z-index: 5;
  @media (min-width: 961px) {
    position: absolute;
    transform: translateY(-100%);
  }
`;

const ExportButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--gray-500);
  border-radius: 50%;
  color: var(--black);
  cursor: pointer;
  display: flex;
  height: 1.75rem;
  justify-content: center;
  line-height: 1;
  padding: 0;
  position: absolute;
  right: 3.25rem;
  top: 1rem;
  width: 1.75rem;
  z-index: 7;
  &:hover,
  &:focus {
    background: var(--white);
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }
`;

const G = styled.g`
  pointer-events: none;
`;

const MapG = styled.g`
  path {
    vector-effect: non-scaling-stroke;
  }
`;

const MapIndicatorSelectWrapper = styled.div`
  .undp-select {
    border: 0 !important;
    box-shadow: none !important;
    cursor: pointer;
    height: 1.55rem !important;
    width: 100%;
  }
  .undp-select.ant-select,
  .undp-select.ant-select-single,
  .undp-select.ant-select-outlined {
    border: 0 !important;
    box-shadow: none !important;
  }
  .undp-select .ant-select-selector {
    background: transparent !important;
    border: 0 !important;
    border-bottom: 1px solid var(--gray-500) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    cursor: pointer !important;
    height: 1.55rem !important;
    min-height: 1.55rem !important;
    overflow: visible !important;
    padding: 0 1.5rem 0 0 !important;
  }
  .undp-select:hover .ant-select-selector,
  .undp-select.ant-select-focused .ant-select-selector,
  .undp-select.ant-select-open .ant-select-selector {
    border: 0 !important;
    border-bottom: 1px solid var(--black) !important;
    box-shadow: none !important;
  }
  .undp-select .ant-select-selection-item,
  .undp-select .ant-select-selection-placeholder {
    align-items: center;
    color: var(--black);
    cursor: pointer !important;
    display: flex;
    font-size: 0.875rem;
    font-weight: 700;
    height: 1.55rem !important;
    line-height: 1.55rem !important;
    max-width: calc(100% - 1.75rem);
    padding: 0 !important;
  }
  .undp-select .ant-select-selection-placeholder {
    color: var(--gray-600);
  }
  .undp-select .ant-select-selection-search {
    bottom: 0 !important;
    inset-inline-end: 1.5rem !important;
    inset-inline-start: 0 !important;
    top: 0 !important;
  }
  .undp-select .ant-select-selection-search-input {
    cursor: pointer !important;
    height: 1.55rem !important;
    line-height: 1.55rem !important;
  }
  .undp-select .ant-select-arrow {
    align-items: center;
    color: var(--black);
    cursor: pointer;
    display: flex;
    height: 1.55rem !important;
    inset-inline-end: 0 !important;
    margin-top: 0 !important;
    top: 0 !important;
    transform: none !important;
  }
  .undp-select .ant-select-arrow .anticon,
  .undp-select .ant-select-arrow svg {
    display: block;
    line-height: 1;
  }
`;

const FILTER_FIT_PADDING = 86;
const FILTER_FIT_MAX_ZOOM = 8;
const MAP_ZOOM_DURATION = 450;
const EXPORT_SCALE = 2;
const SVG_XMLNS = 'http://www.w3.org/2000/svg';

const DASHBOARD_FILTER_KEYS: DashboardFilterKey[] = [
  'funding',
  'genderMarker',
  'category',
  'subCategory',
  'bureau',
  'economy',
  'hdiTier',
  'specialGrouping',
  'continentRegion',
  'subRegion',
  'sahel',
  'crisis',
  'countryCode',
];

const EMPTY_GEOGRAPHIC_FILTERS: Partial<DashboardFilters> = {
  bureau: 'all',
  economy: 'all',
  hdiTier: 'all',
  specialGrouping: 'all',
  continentRegion: 'all',
  subRegion: 'all',
  sahel: 'all',
  crisis: 'all',
  countryCode: 'all',
};

interface Island {
  name: string;
  coordinates: [number, number];
}

const islands: Island[] = [
  { name: 'Comoros', coordinates: [43.3333, -11.6455] },
  { name: 'Sao Tome and Principe', coordinates: [6.6131, 0.1864] },
  { name: 'Maldives', coordinates: [73.4226, 0.3406] },
  { name: 'Nauru', coordinates: [166.9315, -0.5228] },
  { name: 'Tuvalu', coordinates: [179.82, -9.35] },
  { name: 'Vanuatu', coordinates: [166.9592, -15.3767] },
  { name: 'Solomon Islands', coordinates: [160.1562, -9.6457] },
  { name: 'Samoa', coordinates: [-172.1046, -13.759] },
  { name: 'Micronesia (Federated States of)', coordinates: [158.215, 6.887] },
  { name: 'Barbados', coordinates: [-59.5432, 13.1939] },
  { name: 'Kiribati', coordinates: [174.4, -0.7851311643] },
  { name: 'Timor-Leste', coordinates: [125.7275, -8.8742] },
  { name: 'Trinidad and Tobago', coordinates: [-61.3151, 10.6918] },
];

type ProjectedBounds = [[number, number], [number, number]];

const hasActiveDashboardFilters = (filters: DashboardFilters) => DASHBOARD_FILTER_KEYS
  .some((key) => filters[key] !== 'all');

const getDashboardFilterSignature = (filters: DashboardFilters) => DASHBOARD_FILTER_KEYS
  .map((key) => `${key}:${filters[key]}`)
  .join('|');

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const slugifyFilePart = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'map';

const getAntimeridianWrapOffset = (
  lat: number,
  projection: ReturnType<typeof geoEqualEarth>,
) => {
  const leftEdge = projection([-180, lat]);
  const rightEdge = projection([180, lat]);
  if (!leftEdge || !rightEdge) return 0;
  return Math.abs(rightEdge[0] - leftEdge[0]);
};

const getFeatureWrapOffset = (
  feature: any,
  projection: ReturnType<typeof geoEqualEarth>,
) => {
  if (feature?.properties?.ISO3 !== 'WSM') return 0;
  const lat = Number(feature.properties.LAT);
  return getAntimeridianWrapOffset(Number.isFinite(lat) ? lat : 0, projection);
};

const projectCoordinate = (
  coordinates: number[],
  projection: ReturnType<typeof geoEqualEarth>,
  xOffset = 0,
): [number, number] => {
  const point = projection([coordinates[0], coordinates[1]]) as [number, number];
  return [point[0] + xOffset, point[1]];
};

const mergeProjectedBounds = (
  boundsA: ProjectedBounds | undefined,
  boundsB: ProjectedBounds | undefined,
): ProjectedBounds | undefined => {
  if (!boundsA) return boundsB;
  if (!boundsB) return boundsA;
  return [
    [
      Math.min(boundsA[0][0], boundsB[0][0]),
      Math.min(boundsA[0][1], boundsB[0][1]),
    ],
    [
      Math.max(boundsA[1][0], boundsB[1][0]),
      Math.max(boundsA[1][1], boundsB[1][1]),
    ],
  ];
};

const getProjectedBounds = (
  features: any[],
  pathGenerator: any,
): ProjectedBounds | undefined => features.reduce(
  (acc: ProjectedBounds | undefined, feature) => {
    const featureBounds = pathGenerator.bounds(feature) as ProjectedBounds;
    const values = [
      featureBounds[0][0],
      featureBounds[0][1],
      featureBounds[1][0],
      featureBounds[1][1],
    ];
    if (!values.every(Number.isFinite)) return acc;
    return mergeProjectedBounds(acc, featureBounds);
  },
  undefined,
);

const getIslandBounds = (
  activeCountryNames: Set<string>,
  projection: ReturnType<typeof geoEqualEarth>,
): ProjectedBounds | undefined => islands.reduce(
  (acc: ProjectedBounds | undefined, island) => {
    if (!activeCountryNames.has(island.name)) return acc;
    const point = projectAntimeridianAwarePoint(island.coordinates, projection);
    if (!point) return acc;
    const [x, y] = point;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return acc;
    const bounds: ProjectedBounds = [[x - 6, y - 6], [x + 6, y + 6]];
    return mergeProjectedBounds(acc, bounds);
  },
  undefined,
);

const projectAntimeridianAwarePoint = (
  coordinates: [number, number],
  projection: ReturnType<typeof geoEqualEarth>,
) => {
  const point = projection(coordinates);
  if (!point) return point;
  const [lon, lat] = coordinates;
  if (lon >= -150) return point;

  return [
    point[0] + getAntimeridianWrapOffset(lat, projection),
    point[1],
  ] as [number, number];
};

const getCountryBboxBounds = (
  countries: DataType[],
  projection: ReturnType<typeof geoEqualEarth>,
): ProjectedBounds | undefined => countries.reduce(
  (acc: ProjectedBounds | undefined, country) => {
    const bbox = country.bbox;
    if (!bbox?.sw || !bbox?.ne) return acc;

    const west = Number(bbox.sw.lon);
    const east = Number(bbox.ne.lon);
    const south = Number(bbox.sw.lat);
    const north = Number(bbox.ne.lat);
    if (![west, east, south, north].every(Number.isFinite)) return acc;
    if (west === 0 && east === 0 && south === 0 && north === 0) return acc;

    const longitudes = [west, east];
    const latitudes = [south, north];

    const projectedPoints = longitudes.flatMap((lon) => latitudes.map((lat) => (
      projectAntimeridianAwarePoint([lon, lat], projection)
    ))).filter((point): point is [number, number] => (
      !!point && point.every(Number.isFinite)
    ));
    if (!projectedPoints.length) return acc;

    const xs = projectedPoints.map((point) => point[0]);
    const ys = projectedPoints.map((point) => point[1]);
    const bounds: ProjectedBounds = [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)],
    ];
    return mergeProjectedBounds(acc, bounds);
  },
  undefined,
);

const createFitTransform = (
  bounds: ProjectedBounds,
  svgWidth: number,
  svgHeight: number,
) => {
  const [[x0, y0], [x1, y1]] = bounds;
  const boundsWidth = Math.max(x1 - x0, 1);
  const boundsHeight = Math.max(y1 - y0, 1);
  const fitPadding = Math.max(FILTER_FIT_PADDING, Math.min(svgWidth, svgHeight) * 0.16);
  const availableWidth = Math.max(svgWidth - fitPadding * 2, 1);
  const availableHeight = Math.max(svgHeight - fitPadding * 2, 1);
  const scale = Math.min(
    FILTER_FIT_MAX_ZOOM,
    Math.max(1, Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight)),
  );
  const centerX = (x0 + x1) / 2;
  const centerY = (y0 + y1) / 2;
  return zoomIdentity
    .translate(svgWidth / 2 - scale * centerX, svgHeight / 2 - scale * centerY)
    .scale(scale);
};

export const Map = (props: Props) => {
  const {
    data,
    geojsonMapData,
    indicators,
    availableCountryList,
    binningRangeLarge,
  } = props;
  const {
    filters,
    applyDashboardFilters,
    updateDashboardFilter,
    updateXAxisIndicator,
    xAxisIndicator,
  } = useContext(Context) as CtxDataType;
  const selectedCountryCode = filters.countryCode;
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined,
  );
  const [hoverData, setHoverData] = useState<HoverDataType | undefined>(
    undefined,
  );
  const queryParams = new URLSearchParams(window.location.search);
  const svgWidth = queryParams.get('showSettings') === 'false' && window.innerWidth > 960
    ? 1280
    : 960;
  const svgHeight = queryParams.get('showSettings') === 'false' && window.innerWidth > 960
    ? 476
    : 383;
  const mapSvg = useRef<SVGSVGElement>(null);
  const mapG = useRef<SVGGElement>(null);
  const projection = useMemo(
    () => geoEqualEarth()
      .rotate([0, 0])
      .scale(160)
      .translate([svgWidth / 2 - 50, svgHeight / 2 + 25]),
    [svgHeight, svgWidth],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const hasActiveFilters = hasActiveDashboardFilters(filters);
  const filterSignature = getDashboardFilterSignature(filters);
  const xIndicatorMetaData = indicators[
    indicators.findIndex((indicator) => indicator.Indicator === xAxisIndicator)
  ];
  const valueArray = binningRangeLarge[xIndicatorMetaData.DataKey];
  const colorArray = valueArray.length === 5
    ? UNDPColorModule.sequentialColors.neutralColorsx06
    : UNDPColorModule.sequentialColors.neutralColorsx08;
  const colorScale = scaleThreshold<number, string>()
    .domain(valueArray)
    .range(colorArray);
  // translation
  const { t } = useTranslation();
  const zoomBehaviourRef = useRef<any>();
  const options = indicators.map((d) => d.Indicator);

  const exportMap = useCallback(() => {
    if (!mapSvg.current) return;

    const clonedMap = mapSvg.current.cloneNode(true) as SVGSVGElement;
    clonedMap.setAttribute('xmlns', SVG_XMLNS);
    clonedMap.querySelectorAll('rect[fill="#f7f7f7"]').forEach((rect) => {
      rect.setAttribute('fill', 'transparent');
    });

    const legendHeight = 88;
    const exportWidth = svgWidth;
    const exportHeight = svgHeight + legendHeight;
    const legendX = 24;
    const legendY = svgHeight + 18;
    const barWidth = 320;
    const swatchHeight = 10;
    const swatchWidth = barWidth / colorArray.length;
    const indicatorLabel = t(xIndicatorMetaData.TranslationKey);
    const legendSwatches = colorArray.map((color, index) => (
      `<rect x="${index * swatchWidth}" y="24" width="${swatchWidth}" height="${swatchHeight}" fill="${color}" />`
    )).join('');
    const legendLabels = valueArray.map((value, index) => (
      `<text x="${(index + 1) * swatchWidth}" y="52" text-anchor="middle" font-size="12" fill="#212121">${escapeXml(Math.abs(value) < 1 ? `${value}` : format('~s')(value).replace('G', 'B'))}</text>`
    )).join('');
    const serializedMap = clonedMap.innerHTML;
    const exportSvg = `
      <svg xmlns="${SVG_XMLNS}" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
        <style>
          text { font-family: Arial, sans-serif; }
          path { vector-effect: non-scaling-stroke; }
        </style>
        <g>${serializedMap}</g>
        <g transform="translate(${legendX}, ${legendY})">
          <text x="0" y="0" font-size="13" font-weight="700" fill="#212121">${escapeXml(indicatorLabel)}</text>
          <g>
            ${legendSwatches}
            <rect x="0" y="24" width="${barWidth}" height="${swatchHeight}" fill="none" stroke="#212121" stroke-width="0.5" />
            ${legendLabels}
          </g>
        </g>
      </svg>
    `.trim();

    const svgBlob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth * EXPORT_SCALE;
      canvas.height = exportHeight * EXPORT_SCALE;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `sustainable-energy-map-${slugifyFilePart(xAxisIndicator)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, [
    colorArray,
    svgHeight,
    svgWidth,
    t,
    valueArray,
    xAxisIndicator,
    xIndicatorMetaData,
  ]);

  const transitionMapTo = useCallback((transform: ZoomTransform) => {
    if (!zoomBehaviourRef.current || !mapSvg.current) return;
    select(mapSvg.current)
      .interrupt()
      .transition()
      .ease(easeCubicOut)
      .duration(MAP_ZOOM_DURATION)
      .call(zoomBehaviourRef.current.transform, transform);
  }, []);

  useLayoutEffect(() => {
    const mapGSelect = select(mapG.current);
    const mapSvgSelect = select(mapSvg.current);
    const zoomBehaviour = zoom()
      .scaleExtent([1, 12])
      .translateExtent([
        [-20, 0],
        [svgWidth + 20, svgHeight],
      ])
      .on('zoom', ({ transform }) => {
        mapGSelect.attr('transform', transform);
      });
    zoomBehaviourRef.current = zoomBehaviour;
    mapSvgSelect.interrupt().call(zoomBehaviour as any);
  }, [svgHeight, svgWidth]);

  useLayoutEffect(() => {
    if (!zoomBehaviourRef.current || !mapSvg.current) return;
    if (!hasActiveFilters || data.length === 0) {
      transitionMapTo(zoomIdentity);
      return;
    }

    const activeCountryCodes = new Set(data.map((d) => d['Alpha-3 code']));
    const activeCountryNames = new Set(data.map((d) => d['Country or Area']));
    const features = ((geojsonMapData as any).features || []).filter(
      (feature: any) => activeCountryCodes.has(feature.properties.ISO3),
    );
    const countryBboxBounds = getCountryBboxBounds(data, projection);
    const featureBounds = countryBboxBounds || getProjectedBounds(features, pathGenerator);
    const islandBounds = getIslandBounds(activeCountryNames, projection);
    const bounds = mergeProjectedBounds(featureBounds, islandBounds);
    const nextTransform = bounds
      ? createFitTransform(bounds, svgWidth, svgHeight)
      : zoomIdentity;

    transitionMapTo(nextTransform);
  }, [
    data,
    filterSignature,
    geojsonMapData,
    hasActiveFilters,
    pathGenerator,
    projection,
    svgHeight,
    svgWidth,
    transitionMapTo,
  ]);

  return (
    <div style={{ overflow: 'hidden', backgroundColor: 'var(--black-100),', position: 'relative' }}>
      <ExportButton
        aria-label={t('export-map')}
        onClick={exportMap}
        title={t('export-map')}
        type='button'
      >
        <Download aria-hidden='true' size={15} strokeWidth={2} />
      </ExportButton>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} ref={mapSvg}>
        <rect
          y='-20'
          width={svgWidth}
          height={svgHeight + 40}
          fill='#f7f7f7'
          onClick={() => {
            applyDashboardFilters(EMPTY_GEOGRAPHIC_FILTERS);
          }}
        />
        <MapG ref={mapG}>
          {(geojsonMapData as any).features.map((d: any, i: number) => {
            const index = data.findIndex(
              (el: any) => el['Alpha-3 code'] === d.properties.ISO3,
            );
            // const regionOpacity = selectedRegions === 'all' || selectedRegions.indexOf(d.region) !== -1;
            // const countryOpacity = selectedCountries.length === 0 || selectedCountries !== d['Country or Area'];

            if (index !== -1 || d.properties.NAME === 'Antarctica') return null;
            const featureWrapOffset = getFeatureWrapOffset(d, projection);
            return (
              <g key={i} opacity={selectedColor ? 0.5 : 1}>
                {d.geometry.type === 'MultiPolygon'
                  ? d.geometry.coordinates.map((el: any, j: any) => {
                    let masterPath = '';
                    el.forEach((geo: number[][]) => {
                      let path = ' M';
                      geo.forEach((c: number[], k: number) => {
                        const point = projectCoordinate(c, projection, featureWrapOffset);
                        if (k !== geo.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                        else path = `${path}${point[0]} ${point[1]}`;
                      });
                      masterPath += path;
                    });
                    return (
                      <path
                        key={j}
                        d={masterPath}
                        stroke='#fff'
                        strokeWidth={0.2}
                        onClick={() => {
                          if (
                            availableCountryList.includes(d.properties.ISO3)
                          ) {
                            updateDashboardFilter('countryCode', d.properties.ISO3);
                          } else {
                            updateDashboardFilter('countryCode', 'all');
                          }
                        }}
                        fill={COLOR_SCALES.Null}
                      />
                    );
                  })
                  : d.geometry.coordinates.map((el: any, j: number) => {
                    let path = 'M';
                    el.forEach((c: number[], k: number) => {
                      const point = projectCoordinate(c, projection, featureWrapOffset);
                      if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                      else path = `${path}${point[0]} ${point[1]}`;
                    });
                    return (
                      <path
                        key={j}
                        d={path}
                        stroke='#fff'
                        strokeWidth={0.2}
                        onClick={() => {
                          if (
                            availableCountryList.includes(d.properties.ISO3)
                          ) {
                            updateDashboardFilter('countryCode', d.properties.ISO3);
                          } else {
                            updateDashboardFilter('countryCode', 'all');
                          }
                        }}
                        fill={COLOR_SCALES.Null}
                      />
                    );
                  })}
              </g>
            );
          })}
          {data.map((d, i: number) => {
            const index = (geojsonMapData as any).features.findIndex(
              (el: any) => d['Alpha-3 code'] === el.properties.ISO3,
            );
            const indicatorIndex = d.indicators.findIndex(
              (el) => xIndicatorMetaData.DataKey === el.indicator,
            );
            const val = indicatorIndex === -1
              ? undefined
              : d.indicators[indicatorIndex].value;
            const color = val !== undefined ? colorScale(val) : '#f5f9fe';
            // const regionOpacity = selectedRegions === 'all' || selectedRegions === d.region;
            // const countryOpacity = selectedCountries.length === 0 || selectedCountries === d['Country or Area'];
            const activeFeature = index === -1
              ? undefined
              : (geojsonMapData as any).features[index];
            const featureWrapOffset = activeFeature
              ? getFeatureWrapOffset(activeFeature, projection)
              : 0;

            return (
              <g
                key={i}
                opacity={selectedColor && selectedColor !== color ? 0.1 : 1}
                onMouseEnter={(event) => {
                  setHoverData({
                    country: d['Country or Area'],
                    continent: d.region,
                    // outputCategory: d.outputCategory,
                    peopleDirectlyBenefiting: d.indicators.filter(
                      (ind) => ind.indicator === 'directBeneficiaries',
                    )[0].value,
                    grantAmount: d.indicators.filter(
                      (ind) => ind.indicator === 'budget',
                    )[0].value,
                    numberProjects: d.numberProjects,
                    xPosition: event.clientX,
                    yPosition: event.clientY,
                  });
                }}
                onMouseMove={(event) => {
                  setHoverData({
                    country: d['Country or Area'],
                    continent: d.region,
                    peopleDirectlyBenefiting: d.indicators.filter(
                      (ind) => ind.indicator === 'directBeneficiaries',
                    )[0].value,
                    grantAmount: d.indicators.filter(
                      (ind) => ind.indicator === 'budget',
                    )[0].value,
                    numberProjects: d.numberProjects,
                    xPosition: event.clientX,
                    yPosition: event.clientY,
                  });
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!d || d['Alpha-3 code'] === selectedCountryCode) {
                    updateDashboardFilter('countryCode', 'all');
                  } else {
                    updateDashboardFilter('countryCode', d['Alpha-3 code']);
                  }
                }}
                onMouseLeave={() => {
                  setHoverData(undefined);
                }}
              >
                {index === -1
                  ? null
                  : (geojsonMapData as any).features[index].geometry.type
                    === 'MultiPolygon'
                    ? (geojsonMapData as any).features[
                      index
                    ].geometry.coordinates.map((el: any, j: any) => {
                      let masterPath = '';
                      el.forEach((geo: number[][]) => {
                        let path = ' M';
                        geo.forEach((c: number[], k: number) => {
                          const point = projectCoordinate(c, projection, featureWrapOffset);
                          if (k !== geo.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                          else path = `${path}${point[0]} ${point[1]}`;
                        });
                        masterPath += path;
                      });
                      return (
                        <path
                          key={j}
                          d={masterPath}
                          stroke='#fff'
                          strokeWidth={0.2}
                          fill={color}
                        />
                      );
                    })
                    : (geojsonMapData as any).features[
                      index
                    ].geometry.coordinates.map((el: any, j: number) => {
                      let path = 'M';
                      el.forEach((c: number[], k: number) => {
                        const point = projectCoordinate(c, projection, featureWrapOffset);
                        if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                        else path = `${path}${point[0]} ${point[1]}`;
                      });
                      return (
                        <path
                          key={j}
                          d={path}
                          stroke='#fff'
                          strokeWidth={0.2}
                          fill={color}
                        />
                      );
                    })}
              </g>
            );
          })}
          {hoverData
            ? (geojsonMapData as any).features
              .filter(
                (d: any) => d.properties.ISO3
                    === data[
                      data.findIndex(
                        (el: DataType) => el['Country or Area'] === hoverData?.country,
                      )
                    ]['Alpha-3 code'],
              )
              .map((d: any, i: number) => {
                const featureWrapOffset = getFeatureWrapOffset(d, projection);
                return (
                  <G opacity={selectedColor ? 0 : 1} key={i}>
                    {d.geometry.type === 'MultiPolygon'
                      ? d.geometry.coordinates.map((el: any, j: any) => {
                        let masterPath = '';
                        el.forEach((geo: number[][]) => {
                          let path = ' M';
                          geo.forEach((c: number[], k: number) => {
                            const point = projectCoordinate(c, projection, featureWrapOffset);
                            if (k !== geo.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                            else path = `${path}${point[0]} ${point[1]}`;
                          });
                          masterPath += path;
                        });
                        return (
                          <path
                            key={j}
                            d={masterPath}
                            stroke='#212121'
                            opacity={1}
                            strokeWidth={1.5}
                            fillOpacity={0}
                            fill={COLOR_SCALES.Null}
                          />
                        );
                      })
                      : d.geometry.coordinates.map((el: any, j: number) => {
                        let path = 'M';
                        el.forEach((c: number[], k: number) => {
                          const point = projectCoordinate(c, projection, featureWrapOffset);
                          if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                          else path = `${path}${point[0]} ${point[1]}`;
                        });
                        return (
                          <path
                            key={j}
                            d={path}
                            stroke='#212121'
                            opacity={1}
                            strokeWidth={1.5}
                            fillOpacity={0}
                            fill='none'
                          />
                        );
                      })}
                  </G>
                );
              })
            : null}

          {islands.filter((island) => data.some((d) => island.name === d['Country or Area'])).map((island) => {
            const [x, y] = projectAntimeridianAwarePoint(island.coordinates, projection) as [number, number];
            return (
              <circle
                key={island.name}
                cx={x}
                cy={y}
                r={5}
                fill='transparent'
                stroke='black'
                strokeWidth={1}
                pointerEvents='all'
                onMouseEnter={(event) => {
                  const d: any = data.find((el: any) => (el['Country or Area']
                    ? el['Country or Area'].toLowerCase()
                          === island.name.toLowerCase()
                    : false));
                  if (d) {
                    setHoverData({
                      country: d['Country or Area'],
                      continent: d.region,
                      // outputCategory: d.outputCategory,
                      peopleDirectlyBenefiting: d.indicators.filter(
                        (ind: any) => ind.indicator === 'directBeneficiaries',
                      )[0].value,
                      grantAmount: d.indicators.filter(
                        (ind: any) => ind.indicator === 'budget',
                      )[0].value,
                      numberProjects: d.numberProjects,
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }
                }}
                onMouseMove={(event) => {
                  const d: any = data.find((el: any) => (el['Country or Area']
                    ? el['Country or Area'].toLowerCase()
                          === island.name.toLowerCase()
                    : false));
                  if (d) {
                    setHoverData({
                      country: d['Country or Area'],
                      continent: d.region,
                      peopleDirectlyBenefiting: d.indicators.filter(
                        (ind: any) => ind.indicator === 'directBeneficiaries',
                      )[0].value,
                      grantAmount: d.indicators.filter(
                        (ind: any) => ind.indicator === 'budget',
                      )[0].value,
                      numberProjects: d.numberProjects,
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  const d: any = data.find((el: any) => (el['Country or Area']
                    ? el['Country or Area'].toLowerCase()
                          === island.name.toLowerCase()
                    : false));
                  if (!d || d['Alpha-3 code'] === selectedCountryCode) {
                    updateDashboardFilter('countryCode', 'all');
                  } else {
                    updateDashboardFilter('countryCode', d['Alpha-3 code']);
                  }
                }}
                onMouseLeave={() => {
                  setHoverData(undefined);
                }}
              />
            );
          })}
        </MapG>
      </svg>
      <LegendEl>
        <MapIndicatorSelectWrapper
          className='margin-bottom-05'
          style={{ width: '100%', minWidth: '19rem' }}
        >
          <Select
            className='undp-select'
            placeholder={t('please-select')}
            value={xAxisIndicator}
            onChange={(d) => {
              updateXAxisIndicator(d);
            }}
            defaultValue={DEFAULT_VALUES.firstMetric}
          >
            {options.map((d) => (
              <Select.Option className='undp-select-option' key={d}>
                {t(indicators.filter((k) => k.Indicator === d)[0].TranslationKey)}
              </Select.Option>
            ))}
          </Select>
        </MapIndicatorSelectWrapper>
        <svg width='100%' viewBox={`0 0 ${400} ${30}`}>
          <g>
            {valueArray.map((d, i) => (
              <g
                key={i}
                onMouseOver={() => {
                  setSelectedColor(colorArray[i]);
                }}
                onMouseLeave={() => {
                  setSelectedColor(undefined);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={(i * 320) / valueArray.length + 1}
                  y={1}
                  width={320 / valueArray.length - 2}
                  height={8}
                  fill={colorArray[i]}
                  stroke={
                    selectedColor === colorArray[i] ? '#212121' : colorArray[i]
                  }
                />
                <text
                  x={((i + 1) * 320) / valueArray.length}
                  y={25}
                  textAnchor='middle'
                  fontSize={12}
                  fill='#212121'
                >
                  {Math.abs(d) < 1 ? d : format('~s')(d).replace('G', 'B')}
                </text>
              </g>
            ))}
            <g>
              <rect
                onMouseOver={() => {
                  setSelectedColor(colorArray[valueArray.length]);
                }}
                onMouseLeave={() => {
                  setSelectedColor(undefined);
                }}
                x={(valueArray.length * 320) / valueArray.length + 1}
                y={1}
                width={320 / valueArray.length - 2}
                height={8}
                fill={colorArray[valueArray.length]}
                stroke={
                  selectedColor === colorArray[valueArray.length]
                    ? '#212121'
                    : colorArray[valueArray.length]
                }
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
              />
            </g>
          </g>
        </svg>
      </LegendEl>
      {hoverData ? <Tooltip data={hoverData} /> : null}
    </div>
  );
};
