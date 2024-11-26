/* eslint-disable no-console */
import {
  useContext, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { geoEqualEarth } from 'd3-geo';
import { zoom } from 'd3-zoom';
import { format } from 'd3-format';
import { select } from 'd3-selection';
import { Select } from 'antd';
import { scaleThreshold } from 'd3-scale';
import { useTranslation } from 'react-i18next';
import UNDPColorModule from 'undp-viz-colors';
import {
  CtxDataType, DataType, HoverDataType, IndicatorMetaDataType, IndicatorRange,
} from '../../Types';
import Context from '../../Context/Context';
import { COLOR_SCALES, DEFAULT_VALUES } from '../../Constants';
import { Tooltip } from '../../Components/Tooltip';

interface Props {
  data: DataType[];
  geojsonMapData: any[];
  indicators: IndicatorMetaDataType[];
  avaliableCountryList: string[];
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

const G = styled.g`
  pointer-events: none;
`;

export const Map = (props: Props) => {
  const {
    data,
    geojsonMapData,
    indicators,
    avaliableCountryList,
    binningRangeLarge,
  } = props;
  const {
    xAxisIndicator,
    selectedRegions,
    updateSelectedRegions,
    updateXAxisIndicator,
  } = useContext(Context) as CtxDataType;
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [hoverData, setHoverData] = useState<HoverDataType | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState(1);
  const queryParams = new URLSearchParams(window.location.search);
  const svgWidth = queryParams.get('showSettings') === 'false' && window.innerWidth > 960 ? 1280 : 960;
  const svgHeight = queryParams.get('showSettings') === 'false' && window.innerWidth > 960 ? 600 : 480;
  const mapSvg = useRef<SVGSVGElement>(null);
  const mapG = useRef<SVGGElement>(null);
  const projection = geoEqualEarth()
    .rotate([0, 0])
    .scale(200)
    .translate([svgWidth / 2 - 50, svgHeight / 2 + 25]);
  const xIndicatorMetaData = indicators[indicators.findIndex((indicator) => indicator.Indicator === xAxisIndicator)];
  const valueArray = binningRangeLarge[xIndicatorMetaData.DataKey];
  const colorArray = (valueArray.length === 5) ? UNDPColorModule.sequentialColors.neutralColorsx06 : UNDPColorModule.sequentialColors.neutralColorsx08;
  const colorScale = scaleThreshold<number, string>().domain(valueArray).range(colorArray);
  // translation
  const { t } = useTranslation();

  const options = indicators.map((d) => d.Indicator);

  useEffect(() => {
    if (options.findIndex((d) => d === xAxisIndicator) === -1) {
      updateXAxisIndicator(options[0]);
    }
  }, [options]);

  useEffect(() => {
    const mapGSelect = select(mapG.current);
    const mapSvgSelect = select(mapSvg.current);
    const zoomBehaviour = zoom()
      .scaleExtent([1, 12])
      .translateExtent([[-20, 0], [svgWidth + 20, svgHeight]])
      .on('zoom', ({ transform }) => {
        setZoomLevel(transform.k);
        mapGSelect.attr('transform', transform);
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapSvgSelect.call(zoomBehaviour as any);
  }, [svgHeight, svgWidth]);

  interface Island {
    name: string;
    coordinates: [number, number]; // Tuple type
    Shape_Area: number;
  }
  const islands: Island[] = [
    { name: 'Comoros', coordinates: [43.3333, -11.6455], Shape_Area: 0.138595443196436 },
    { name: 'São Tomé and Príncipe', coordinates: [6.6131, 0.1864], Shape_Area: 0.081550074140014 },
    { name: 'Seychelles', coordinates: [55.491977, -4.6796], Shape_Area: 0.0417638689720024 },
    { name: 'Maldives', coordinates: [73.4226, 0.3406], Shape_Area: 0.0168859206897437 },
  ];

  useEffect(() => {
    if (mapG.current) {
      const mapGSelect = select(mapG.current);
      islands.forEach((island) => {
        const [x, y] = projection(island.coordinates) as [number, number];
        mapGSelect
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 2) // Adjust the radius for visibility
          .attr('fill', 'none') // No fill
          .attr('stroke', 'black') // Border color
          .attr('stroke-width', 0.3) // Adjust border width
          .attr('pointer-events', "none"); // Prevent the circle from interfering with interactions
      });
    }
  }, [projection]);
  return (
    <div style={{ overflow: 'hidden', backgroundColor: 'var(--black-100),' }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        ref={mapSvg}
      >
        <rect
          y='-20'
          width={svgWidth}
          height={svgHeight + 40}
          fill='#f7f7f7'
          onClick={() => {
            updateSelectedRegions('all');
          }}
        />
        <g ref={mapG}>
          {
            (geojsonMapData as any).features.map((d: any, i: number) => {
              const index = data.findIndex((el: any) => el['Alpha-3 code'] === d.properties.ISO3);
              // const regionOpacity = selectedRegions === 'all' || selectedRegions.indexOf(d.region) !== -1;
              // const countryOpacity = selectedCountries.length === 0 || selectedCountries !== d['Country or Area'];

              if ((index !== -1) || d.properties.NAME === 'Antarctica') return null;
              return (
                <g
                  key={i}
                  opacity={selectedColor ? 0.5 : 1}
                >
                  {
                  d.geometry.type === 'MultiPolygon' ? d.geometry.coordinates.map((el:any, j: any) => {
                    let masterPath = '';
                    el.forEach((geo: number[][]) => {
                      let path = ' M';
                      geo.forEach((c: number[], k: number) => {
                        const point = projection([c[0], c[1]]) as [number, number];
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
                        strokeWidth={0.2 / zoomLevel}
                        onClick={() => {
                          if (avaliableCountryList.includes(d.properties.ISO3)) {
                            updateSelectedRegions(d.properties.ISO3);
                          } else {
                            updateSelectedRegions('all');
                          }
                        }}
                        fill={COLOR_SCALES.Null}
                      />
                    );
                  }) : d.geometry.coordinates.map((el:any, j: number) => {
                    let path = 'M';
                    el.forEach((c: number[], k: number) => {
                      const point = projection([c[0], c[1]]) as [number, number];
                      if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                      else path = `${path}${point[0]} ${point[1]}`;
                    });
                    return (
                      <path
                        key={j}
                        d={path}
                        stroke='#fff'
                        strokeWidth={0.2 / zoomLevel}
                        onClick={() => {
                          if (avaliableCountryList.includes(d.properties.ISO3)) {
                            updateSelectedRegions(d.properties.ISO3);
                          } else {
                            updateSelectedRegions('all');
                          }
                        }}
                        fill={COLOR_SCALES.Null}
                      />
                    );
                  })
                }
                </g>
              );
            })
          }
          {
            data.map((d, i: number) => {
              const index = (geojsonMapData as any).features.findIndex((el: any) => d['Alpha-3 code'] === el.properties.ISO3);
              const indicatorIndex = d.indicators.findIndex((el) => xIndicatorMetaData.DataKey === el.indicator);
              const val = indicatorIndex === -1 ? undefined : d.indicators[indicatorIndex].value;
              const color = val !== undefined ? colorScale(val) : '#f5f9fe';
              // const regionOpacity = selectedRegions === 'all' || selectedRegions === d.region;
              // const countryOpacity = selectedCountries.length === 0 || selectedCountries === d['Country or Area'];

              return (
                <g
                  key={i}
                  opacity={selectedColor && selectedColor !== color ? 0.1 : 1}
                  onMouseEnter={(event) => {
                    setHoverData({
                      country: d['Country or Area'],
                      continent: d.region,
                      // outputCategory: d.outputCategory,
                      peopleDirectlyBenefiting: d.indicators.filter((ind) => ind.indicator === 'directBeneficiaries')[0].value,
                      grantAmount: d.indicators.filter((ind) => ind.indicator === 'budget')[0].value,
                      energySaved: d.indicators.filter((ind) => ind.indicator === 'energySaved')[0].value,
                      mwAdded: d.indicators.filter((ind) => ind.indicator === 'mwAdded')[0].value,
                      ghgEmissions: d.indicators.filter((ind) => ind.indicator === 'ghgEmissions')[0].value,
                      numberProjects: d.numberProjects,
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }}
                  onMouseMove={(event) => {
                    setHoverData({
                      country: d['Country or Area'],
                      continent: d.region,
                      peopleDirectlyBenefiting: d.indicators.filter((ind) => ind.indicator === 'directBeneficiaries')[0].value,
                      grantAmount: d.indicators.filter((ind) => ind.indicator === 'budget')[0].value,
                      energySaved: d.indicators.filter((ind) => ind.indicator === 'energySaved')[0].value,
                      mwAdded: d.indicators.filter((ind) => ind.indicator === 'mwAdded')[0].value,
                      ghgEmissions: d.indicators.filter((ind) => ind.indicator === 'ghgEmissions')[0].value,
                      numberProjects: d.numberProjects,
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }}
                  onClick={() => {
                    if (d['Alpha-3 code'] === selectedRegions) {
                      updateSelectedRegions('all');
                    } else {
                      updateSelectedRegions(d['Alpha-3 code']);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoverData(undefined);
                  }}
                >
                  {
                    index === -1 ? null
                      : (geojsonMapData as any).features[index].geometry.type === 'MultiPolygon' ? (geojsonMapData as any).features[index].geometry.coordinates.map((el:any, j: any) => {
                        let masterPath = '';
                        el.forEach((geo: number[][]) => {
                          let path = ' M';
                          geo.forEach((c: number[], k: number) => {
                            const point = projection([c[0], c[1]]) as [number, number];
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
                            strokeWidth={0.2 / zoomLevel}
                            fill={color}
                          />
                        );
                      }) : (geojsonMapData as any).features[index].geometry.coordinates.map((el:any, j: number) => {
                        let path = 'M';
                        el.forEach((c: number[], k: number) => {
                          const point = projection([c[0], c[1]]) as [number, number];
                          if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                          else path = `${path}${point[0]} ${point[1]}`;
                        });
                        return (
                          <path
                            key={j}
                            d={path}
                            stroke='#fff'
                            strokeWidth={0.2 / zoomLevel}
                            fill={color}
                          />
                        );
                      })
                  }
                </g>
              );
            })
          }
          {
            hoverData
              ? (geojsonMapData as any).features.filter((d: any) => d.properties.ISO3 === data[data.findIndex((el: DataType) => el['Country or Area'] === hoverData?.country)]['Alpha-3 code']).map((d: any, i: number) => (
                <G
                  opacity={selectedColor ? 0 : 1}
                  key={i}
                >
                  {
                    d.geometry.type === 'MultiPolygon' ? d.geometry.coordinates.map((el:any, j: any) => {
                      let masterPath = '';
                      el.forEach((geo: number[][]) => {
                        let path = ' M';
                        geo.forEach((c: number[], k: number) => {
                          const point = projection([c[0], c[1]]) as [number, number];
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
                          strokeWidth={1.5 / zoomLevel}
                          fillOpacity={0}
                          fill={COLOR_SCALES.Null}
                        />
                      );
                    }) : d.geometry.coordinates.map((el:any, j: number) => {
                      let path = 'M';
                      el.forEach((c: number[], k: number) => {
                        const point = projection([c[0], c[1]]) as [number, number];
                        if (k !== el.length - 1) path = `${path}${point[0]} ${point[1]}L`;
                        else path = `${path}${point[0]} ${point[1]}`;
                      });
                      return (
                        <path
                          key={j}
                          d={path}
                          stroke='#212121'
                          opacity={1}
                          strokeWidth={1.5 / zoomLevel}
                          fillOpacity={0}
                          fill='none'
                        />
                      );
                    })
                  }
                </G>
              )) : null
          }
        </g>
      </svg>
      <LegendEl>
        <div className='margin-bottom-05' style={{ width: '100%', minWidth: '19rem' }}>
          <p className='label'>{t('select-indicator')}</p>
          <Select
            className='undp-select'
            placeholder='Please select'
            value={xAxisIndicator}
            onChange={(d) => { updateXAxisIndicator(d); }}
            defaultValue={DEFAULT_VALUES.firstMetric}
          >
            {
              options.map((d) => (
                <Select.Option className='undp-select-option' key={d}>{t(indicators.filter((k) => k.Indicator === d)[0].TranslationKey)}</Select.Option>
              ))
            }
          </Select>
        </div>
        <svg width='100%' viewBox={`0 0 ${400} ${30}`}>
          <g>
            {
              valueArray.map((d, i) => (
                <g
                  key={i}
                  onMouseOver={() => { setSelectedColor(colorArray[i]); }}
                  onMouseLeave={() => { setSelectedColor(undefined); }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={(i * 320) / valueArray.length + 1}
                    y={1}
                    width={(320 / valueArray.length) - 2}
                    height={8}
                    fill={colorArray[i]}
                    stroke={selectedColor === colorArray[i] ? '#212121' : colorArray[i]}
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
              ))
            }
            <g>
              <rect
                onMouseOver={() => { setSelectedColor(colorArray[valueArray.length]); }}
                onMouseLeave={() => { setSelectedColor(undefined); }}
                x={((valueArray.length * 320) / valueArray.length) + 1}
                y={1}
                width={(320 / valueArray.length) - 2}
                height={8}
                fill={colorArray[valueArray.length]}
                stroke={selectedColor === colorArray[valueArray.length] ? '#212121' : colorArray[valueArray.length]}
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
              />
            </g>
          </g>
        </svg>
      </LegendEl>
      {
        hoverData ? <Tooltip data={hoverData} /> : null
      }
    </div>
  );
};
