import {
  useContext, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { geoMercator } from 'd3-geo';
import { zoom } from 'd3-zoom';
import { format } from 'd3-format';
import { select } from 'd3-selection';
import { scaleThreshold } from 'd3-scale';
import {
  CtxDataType, DataType, HoverDataType, IndicatorMetaDataType, ProjectCoordinateDataType, ProjectHoverDataType,
} from '../Types';
import Context from '../Context/Context';
import World from '../Data/worldMap.json';
import { COLOR_SCALES } from '../Constants';
import { Tooltip } from '../Components/Tooltip';
import { ProjectTooltip } from '../Components/ProjectTooltip';

interface Props {
  data: DataType[];
  projectCoordinatesData: ProjectCoordinateDataType[];
  indicators: IndicatorMetaDataType[];
}

const LegendEl = styled.div`
  padding: 0.5rem 0.5rem 0 0.5rem;
  background-color:rgba(255,255,255,0.5);
  box-shadow: var(--shadow);
  width: 440px;
  margin-left: 1rem;
  margin-top: -1rem;
  position: relative;
  z-index: 5;
  @media (min-width: 961px) {
    transform: translateY(-100%);
  }
`;

const G = styled.g`
  pointer-events: none;
`;

export const UnivariateMap = (props: Props) => {
  const {
    data,
    projectCoordinatesData,
    indicators,
  } = props;
  const {
    xAxisIndicator,
    selectedCountries,
    selectedRegions,
    selectedProjects,
    showProjectLocations,
    selectedTaxonomy,
    updateSelectedProjects,
  } = useContext(Context) as CtxDataType;
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [hoverData, setHoverData] = useState<HoverDataType | undefined>(undefined);
  const [projectHoverData, setProjectHoverData] = useState<ProjectHoverDataType | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState(1);
  const queryParams = new URLSearchParams(window.location.search);
  const svgWidth = queryParams.get('showSettings') === 'false' && window.innerWidth > 960 ? 1280 : 960;
  const svgHeight = queryParams.get('showSettings') === 'false' && window.innerWidth > 960 ? 640 : 530;
  const mapSvg = useRef<SVGSVGElement>(null);
  const mapG = useRef<SVGGElement>(null);
  const projection = geoMercator().rotate([0, 0]).scale(154).translate([475, 300]);
  const xIndicatorMetaData = indicators[indicators.findIndex((indicator) => indicator.Indicator === xAxisIndicator)];
  const valueArray = xIndicatorMetaData.BinningRangeLarge;
  const colorArray = COLOR_SCALES.Linear[`RedColor${(valueArray.length + 1) as 4 | 5 | 6 | 7 | 8 | 9 | 10}`];
  const colorScale = scaleThreshold<number, string>().domain(valueArray).range(colorArray);
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
  return (
    <div style={{ height: '100%', overflow: 'hidden', backgroundColor: 'var(--black-100),' }}>
      <svg
        width='100%'
        height='100%'
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        ref={mapSvg}
      >
        <rect y='-20' width={svgWidth} height={svgHeight + 40} fill='#f7f7f7' />
        <g ref={mapG}>
          {
            (World as any).features.map((d: any, i: number) => {
              const index = data.findIndex((el: any) => el['Alpha-3 code-1'] === d.properties.ISO3);
              const regionOpacity = selectedRegions === 'All' || selectedRegions.indexOf(d.region) !== -1;
              const countryOpacity = selectedCountries.length === 0 || selectedCountries !== d['Country or Area'];

              if ((index !== -1) || d.properties.NAME === 'Antarctica') return null;
              return (
                <g
                  key={i}
                  opacity={regionOpacity && countryOpacity && !selectedColor ? 1 : 0.2}
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
                        stroke='#999'
                        strokeWidth={1 / zoomLevel}
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
                        stroke='#999'
                        strokeWidth={1 / zoomLevel}
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
              const index = (World as any).features.findIndex((el: any) => d['Alpha-3 code-1'] === el.properties.ISO3);
              const indicatorIndex = d.indicators.findIndex((el) => xIndicatorMetaData.DataKey === el.indicator);
              const val = indicatorIndex === -1 ? undefined : d.indicators[indicatorIndex].value;
              const color = val !== undefined ? colorScale(val) : '#f5f9fe';

              const regionOpacity = selectedRegions === 'All' || selectedRegions === d.region;
              const countryOpacity = selectedCountries.length === 0 || selectedCountries === d['Country or Area'];

              return (
                <g
                  key={i}
                  opacity={
                    selectedColor
                      ? selectedColor === color ? 1 : 0.1
                      : regionOpacity && countryOpacity ? 1 : 0.1
                  }
                  onMouseEnter={(event) => {
                    if (regionOpacity) {
                      setHoverData({
                        country: d['Country or Area'],
                        continent: d['Group 1'],
                        peopleDirectlyBenefiting: d.indicators.filter((ind) => ind.indicator === 'people directly benefiting')[0].value,
                        emissionsReduced: d.indicators.filter((ind) => ind.indicator === 'tonnes of CO2-eq emissions avoided or reduced')[0].value,
                        grantAmountVerticalFund: d.indicators.filter((ind) => ind.indicator === 'grant_amount_vertical_fund')[0].value,
                        expensesVerticalFund: d.indicators.filter((ind) => ind.indicator === 'expenses_vertical_fund')[0].value,
                        coFinancingVerticalFund: d.indicators.filter((ind) => ind.indicator === 'cofinancing_vertical_fund')[0].value,
                        numberProjects: d.indicators.filter((ind) => ind.indicator === 'Number of projects')[0].value,
                        xPosition: event.clientX,
                        yPosition: event.clientY,
                      });
                    }
                  }}
                  onMouseMove={(event) => {
                    if (regionOpacity) {
                      setHoverData({
                        country: d['Country or Area'],
                        continent: d['Group 1'],
                        peopleDirectlyBenefiting: d.indicators.filter((ind) => ind.indicator === 'people directly benefiting')[0].value,
                        emissionsReduced: d.indicators.filter((ind) => ind.indicator === 'tonnes of CO2-eq emissions avoided or reduced')[0].value,
                        grantAmountVerticalFund: d.indicators.filter((ind) => ind.indicator === 'grant_amount_vertical_fund')[0].value,
                        expensesVerticalFund: d.indicators.filter((ind) => ind.indicator === 'expenses_vertical_fund')[0].value,
                        coFinancingVerticalFund: d.indicators.filter((ind) => ind.indicator === 'cofinancing_vertical_fund')[0].value,
                        numberProjects: d.indicators.filter((ind) => ind.indicator === 'Number of projects')[0].value,
                        xPosition: event.clientX,
                        yPosition: event.clientY,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoverData(undefined);
                  }}
                >
                  {
                    index === -1 ? null
                      : (World as any).features[index].geometry.type === 'MultiPolygon' ? (World as any).features[index].geometry.coordinates.map((el:any, j: any) => {
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
                            stroke='#999'
                            strokeWidth={1 / zoomLevel}
                            fill={color}
                          />
                        );
                      }) : (World as any).features[index].geometry.coordinates.map((el:any, j: number) => {
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
                            stroke='#999'
                            strokeWidth={1 / zoomLevel}
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
              ? (World as any).features.filter((d: any) => d.properties.ISO3 === data[data.findIndex((el: DataType) => el['Country or Area'] === hoverData?.country)]['Alpha-3 code-1']).map((d: any, i: number) => (
                <G
                  opacity={!selectedColor ? 1 : 0}
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
          {
            showProjectLocations
            && projectCoordinatesData.filter((d) => selectedTaxonomy === 'All' || d.taxonomy === selectedTaxonomy).map((d, i: number) => {
              const regionOpacity = selectedRegions === 'All' || selectedRegions === d.Region;
              const countryOpacity = selectedCountries.length === 0 || selectedCountries === d['Lead Country'];
              const projectOpacity = selectedProjects === '' || selectedProjects === d.project_id.toString();
              const point = projection([d.Longitude, d.Latitude]) as [number, number];
              return (
                <g
                  key={i}
                  opacity={projectOpacity && countryOpacity && regionOpacity ? 0.9 : 0.01}
                  onMouseEnter={(event) => {
                    updateSelectedProjects(d.project_id.toString());
                    setProjectHoverData({
                      name: d['Short Title'],
                      donor: d['Sources of Funds'],
                      timeframe: d['Programme Period'],
                      status: d.status,
                      grantAmount: d['Grant Amount'],
                      expenses: d['GL Expenses'],
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }}
                  onMouseMove={(event) => {
                    updateSelectedProjects(d.project_id.toString());
                    setProjectHoverData({
                      name: d['Short Title'],
                      donor: d['Sources of Funds'],
                      timeframe: d['Programme Period'],
                      status: d.status,
                      grantAmount: d['Grant Amount'],
                      expenses: d['GL Expenses'],
                      xPosition: event.clientX,
                      yPosition: event.clientY,
                    });
                  }}
                  onMouseLeave={() => {
                    updateSelectedProjects('');
                    setProjectHoverData(undefined);
                  }}
                >
                  <circle
                    key={i}
                    cx={point[0]}
                    cy={point[1]}
                    r={5 / zoomLevel}
                    fill='#FFF'
                    stroke='#006EB5'
                    strokeWidth={0.7 / zoomLevel}
                  />
                </g>
              );
            })
          }
        </g>
      </svg>
      <LegendEl>
        <h6 className='undp-typography'>{xIndicatorMetaData.IndicatorLabelTable}</h6>
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
                    x={(i * 320) / colorArray.length + 1}
                    y={1}
                    width={(320 / colorArray.length) - 2}
                    height={8}
                    fill={colorArray[i]}
                    stroke={selectedColor === colorArray[i] ? '#212121' : colorArray[i]}
                  />
                  <text
                    x={((i + 1) * 320) / colorArray.length}
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
                x={((valueArray.length * 320) / colorArray.length) + 1}
                y={1}
                width={(320 / colorArray.length) - 2}
                height={8}
                fill={colorArray[valueArray.length]}
                stroke={selectedColor === colorArray[valueArray.length] ? '#212121' : colorArray[valueArray.length]}
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
              />
            </g>
            <g>
              <g
                key='null'
                onMouseOver={() => { setSelectedColor('#f5f9fe'); }}
                onMouseLeave={() => { setSelectedColor(undefined); }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={340}
                  y={1}
                  width={38}
                  height={8}
                  fill='#f5f9fe'
                  stroke={selectedColor === '#f5f9fe' ? '#212121' : '#f5f9fe'}
                />
                <text
                  x={360}
                  y={25}
                  textAnchor='middle'
                  fontSize={12}
                  fill='#212121'
                >
                  Missing
                </text>
              </g>
            </g>
          </g>
        </svg>
      </LegendEl>
      {
        hoverData ? <Tooltip data={hoverData} /> : null
      }
      {
        projectHoverData ? <ProjectTooltip data={projectHoverData} /> : null
      }
    </div>
  );
};
