import { useEffect, useRef, useState } from 'react';
import maplibreGl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import UNDPColorModule from 'undp-viz-colors';
import * as pmtiles from 'pmtiles';
import pattern from '../assets/diagonal-hatch-white_30.png';
import { CountryMapTooltip } from './CountryMapTooltip';
import { CountryGroupDataType } from '../Types';
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

interface Props {
  country: CountryGroupDataType;
}
interface HoverDataProps {
  district: string;
  country: string;
  pctValue?: number;
  popValue?: number;
  popRuralNoAccess?: number;
  popUrbanNoAccess?: number;
  xPosition: number;
  yPosition: number;
}

const colorScale = [...UNDPColorModule.divergentColors.colorsx10].reverse();
export const CountryMap = (props: Props) => {
  const {
    country,
  } = props;
  // const year = 2020;
  const [showRwi, setShowRwi] = useState<Boolean>(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const [hoverData, setHoverData] = useState<null | HoverDataProps>(null);
  const keyBarWid = 40;
  const pctRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const displayRWI = (e:CheckboxChangeEvent) => {
    // console.log(`checked = ${e.target.checked}`);
    setShowRwi(e.target.checked);
  };
  const protocol = new pmtiles.Protocol();
  // translation
  const { t } = useTranslation();
  // when loading for the first time
  useEffect(() => {
    let districtHoveredStateId: string | null = null;
    maplibreGl.addProtocol('pmtiles', protocol.tile);
    if (map.current) return;
    // initiate map and add base layer
    (map as any).current = new maplibreGl.Map({
      container: mapContainer.current as any,
      style: {
        version: 8,
        sources: {
          admin0: {
            type: 'vector',
            tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/adm0_polygons/{z}/{x}/{y}.pbf'],
          },
          admin2data: {
            type: 'vector',
            url: 'pmtiles://https://undpngddlsgeohubdev01.blob.core.windows.net/admin/urban_rural_District_ElectricityAccess_20230411183105.pmtiles',
          },
        },
        layers: [
          {
            id: 'admin0fill',
            type: 'fill',
            source: 'admin0',
            'source-layer': 'adm0_polygons',
            paint: {
              'fill-color': '#FFFFFF',
            },
            minzoom: 0,
            maxzoom: 22,
          },
          {
            id: 'admin0line',
            type: 'line',
            source: 'admin0',
            'source-layer': 'adm0_polygons',
            paint: {
              'line-color': '#A9B1B7',
              'line-width': 0.5,
            },
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [country['Longitude (average)'], country['Latitude (average)']],
      zoom: 4, // starting zoom
    });
    (map as any).current.on('load', () => {
      (map as any).current.addLayer(
        {
          id: 'admin2choropleth',
          type: 'fill',
          source: 'admin2data',
          'source-layer': 'tmpk_z_jokg',
          paint: {
            'fill-color': [
              'let',
              'percentAccess',
              ['/', ['get', 'PopAccess2020'], ['get', 'TotPopulation']],
              [
                'interpolate',
                ['linear'],
                ['var', 'percentAccess'],
                0, colorScale[0],
                0.0999, colorScale[0],
                0.1, colorScale[1],
                0.1999, colorScale[1],
                0.2, colorScale[2],
                0.2999, colorScale[2],
                0.3, colorScale[3],
                0.3999, colorScale[3],
                0.4, colorScale[4],
                0.4999, colorScale[4],
                0.5, colorScale[5],
                0.5999, colorScale[5],
                0.6, colorScale[6],
                0.6999, colorScale[6],
                0.7, colorScale[7],
                0.7999, colorScale[7],
                0.8, colorScale[8],
                0.8999, colorScale[8],
                0.9, colorScale[9],
                1, colorScale[9],
              ],
            ],
            'fill-opacity': 1,
            'fill-outline-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              'hsla(0, 0%, 0%, 1)',
              'hsla(0, 0%, 100%, 0.5)',
            ],
          },
          filter: ['==', 'adm0_name', country['Country or Area']],
          minzoom: 0,
          maxzoom: 22,
        },
      );
      (map as any).current.addLayer({
        id: 'admin2rwi',
        type: 'fill',
        source: 'admin2data',
        'source-layer': 'tmpk_z_jokg',
        paint: {
          'fill-pattern': 'pattern',
        },
        filter: ['<', 'RWI', 0],
        layout: {
          visibility: 'none',
        },
        /* filter: ['all',
          ['<', 'RWI', 1],
          ['==', 'adm0_name', country['Country or Area']],
        ], */
      });
      (map as any).current.loadImage(pattern, (err:any, image:any) => {
        if (err) throw err;
        (map as any).current.addImage('pattern', image);
      });
      (map as any).current.on('mousemove', 'admin2choropleth', (e:any) => {
        (map as any).current.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          districtHoveredStateId = e.features[0].layer.id;
          if (districtHoveredStateId) {
            // console.log('===========', e.features[0].properties.PopAccess2020, e.features[0].properties.PopNoAccess2020, e.features[0].properties.PopAccess2020 + e.features[0].properties.PopNoAccess2020, e.features[0].properties.TotPopulation);
            setHoverData({
              district: e.features[0].properties.adm2_name !== ' ' && e.features[0].properties.adm2_name !== '' && e.features[0].properties.adm2_name ? e.features[0].properties.adm2_name : e.features[0].properties.adm1_name,
              country: e.features[0].properties.adm0_name,
              pctValue: (e.features[0].properties.PopAccess2020 / e.features[0].properties.TotPopulation) * 100,
              popValue: e.features[0].properties.PopNoAccess2020,
              popRuralNoAccess: e.features[0].properties.PopRuralNoAccess2020,
              popUrbanNoAccess: e.features[0].properties.PopUrbanNoAccess2020,
              xPosition: e.originalEvent.clientX,
              yPosition: e.originalEvent.clientY,
            });
            (map as any).current.setFeatureState(
              { source: 'admin2data', id: districtHoveredStateId, sourceLayer: 'tmpk_z_jokg' },
              { hover: true },
            );
          }
        }
      });

      (map as any).current.on('mouseleave', 'admin2choropleth', () => {
        if (districtHoveredStateId) {
          setHoverData(null);
          (map as any).current.setFeatureState(
            { source: 'admin2data', id: districtHoveredStateId, sourceLayer: 'tmpk_z_jokg' },
            { hover: false },
          );
        }
        districtHoveredStateId = null;
      });
    });
  });
  // when changing country
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('admin2choropleth')) {
        (map as any).current.setFilter('admin2choropleth', ['==', 'adm0_name', country['Country or Area']]);
        (map as any).current.flyTo({
          center: [country['Longitude (average)'], country['Latitude (average)']],
        }); // starting position [lng, lat]
        (map as any).current.fitBounds([
          [country.bbox.sw.lon, country.bbox.sw.lat],
          [country.bbox.ne.lon, country.bbox.ne.lat],
        ]);
      }
    }
  }, [country]);
  useEffect(() => {
    if (map.current) {
      if ((map as any).current.getLayer('admin2rwi')) {
        if (showRwi) (map as any).current.setLayoutProperty('admin2rwi', 'visibility', 'visible');
        else (map as any).current.setLayoutProperty('admin2rwi', 'visibility', 'none');
      }
    }
  }, [showRwi]);
  return (
    <div>
      <div
        ref={mapContainer}
        className='map'
      />
      <div className='map-legend-container flex-div flex-wrap'>
        <div style={{ flex: '1 1 26.5rem' }}>
          <div className='title margin-top-01'>
            {t('map-percent-access')}
            <sup> 1</sup>
          </div>
          <svg height='25' width={colorScale.length * keyBarWid + 30}>
            <g transform='translate(10,0)'>
              {
                colorScale.map((d: string, i: number) => (
                  <rect
                    key={i}
                    x={i * keyBarWid}
                    height={10}
                    y={0}
                    width={keyBarWid}
                    fill={d}
                  />
                ))
              }
              {
                pctRange.map((d: number, i: number) => (
                  <text
                    key={i}
                    x={(i) * keyBarWid}
                    y={23}
                    textAnchor='middle'
                    fontSize={10}
                  >
                    {d}
                    %
                  </text>
                ))
              }
            </g>
          </svg>
        </div>
        <div className='rwi-legend' style={{ flex: '2 1 11rem' }}>
          <Checkbox className='undp-checkbox' onChange={displayRWI}>
            <div className='title'>
              {t('map-highlight-poor')}
              <sup> 2</sup>
            </div>
          </Checkbox>
          <div className='rwi-legend-pattern' />
        </div>
      </div>
      {
        hoverData ? <CountryMapTooltip district={hoverData.district} country={hoverData.country} popValue={hoverData.popValue} popRuralNoAccess={hoverData.popRuralNoAccess} popUrbanNoAccess={hoverData.popUrbanNoAccess} pctValue={hoverData.pctValue} xPosition={hoverData.xPosition} yPosition={hoverData.yPosition} /> : null
      }
    </div>
  );
};
