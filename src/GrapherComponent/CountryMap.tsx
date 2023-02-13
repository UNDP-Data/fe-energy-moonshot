import {
  useEffect, useRef, useState,
} from 'react';
import { geoMercator } from 'd3-geo';
import { zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import {
  CountryGroupDataType,
} from '../Types';
import World from '../Data/worldMap.json';
import { COLOR_SCALES } from '../Constants';

interface Props {
  selectedCountry: CountryGroupDataType;
}

export const CountryMap = (props: Props) => {
  const {
    selectedCountry,
  } = props;
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgWidth = 1280;
  const svgHeight = 530;
  const mapSvg = useRef<SVGSVGElement>(null);
  const mapG = useRef<SVGGElement>(null);
  const projection = geoMercator().rotate([0, 0]).scale(154).translate([475, 300]);
  const countryMapData = World.features.filter((el:any) => el.properties.ISO3 === selectedCountry['Alpha-3 code-1'])[0];
  // eslint-disable-next-line no-console
  console.log('countryMapData', World.features);
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
          countryMapData
            ? (
              <g>
                {
                countryMapData.geometry.type === 'MultiPolygon' ? countryMapData.geometry.coordinates.map((el:any, j: any) => {
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
                      fill={COLOR_SCALES.Null}
                    />
                  );
                }) : countryMapData.geometry.coordinates.map((el:any, j: number) => {
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
                      fill={COLOR_SCALES.Null}
                    />
                  );
                })
              }
              </g>
            ) : null
          }
        </g>
      </svg>
    </div>
  );
};
