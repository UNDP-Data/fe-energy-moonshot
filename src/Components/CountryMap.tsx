import maplibreGl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Radio } from 'antd';
import UNDPColorModule from 'undp-viz-colors';
import { useEffect, useRef, useState } from 'react';
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
  xPosition: number;
  yPosition: number;
}
const colorScale = UNDPColorModule.divergentColors.colorsx11;
export const CountryMap = (props: Props) => {
  const {
    country,
  } = props;
  const year = 2020;
  const map = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('hrea');
  const [hoverData, setHoverData] = useState<null | HoverDataProps>(null);
  useEffect(() => {
    let districtHoveredStateId: string | null = null;
    if (map.current) return;
    // initiate map and add base layer
    (map as any).current = new maplibreGl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          admin2: {
            type: 'vector',
            tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/adm2_polygons/{z}/{x}/{y}.pbf'],
          },
        },
        layers: [
          {
            id: 'admin2',
            type: 'line',
            source: 'admin2',
            'source-layer': 'adm2_polygons',
            paint: {
              'line-color': 'hsla(0, 0%, 50%, 0.9)',
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
      // mouse over effect on district layer
      (map as any).current.on('mousemove', 'admin2a', (e:any) => {
        (map as any).current.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          districtHoveredStateId = e.features[0].layer.id;
          if (districtHoveredStateId) {
            setHoverData({
              district: e.features[0].properties.adm2_name !== ' ' && e.features[0].properties.adm2_name !== '' && e.features[0].properties.adm2_name ? e.features[0].properties.adm2_name : e.features[0].properties.adm1_name,
              country: country['Country or Area'],
              pctValue: e.features[0].properties.hrea_2020 * 100,
              popValue: e.features[0].properties.pop_no_hrea_2020,
              xPosition: e.originalEvent.clientX,
              yPosition: e.originalEvent.clientY,
            });
            (map as any).current.setFeatureState(
              { source: 'admin2', id: districtHoveredStateId, sourceLayer: 'adm2_polygons' },
              { hover: true },
            );
          }
        }
      });
      (map as any).current.on('mouseleave', 'admin2a', () => {
        if (districtHoveredStateId) {
          setHoverData(null);
          (map as any).current.setFeatureState(
            { source: 'admin2', id: districtHoveredStateId, sourceLayer: 'adm2_polygons' },
            { hover: false },
          );
        }
        districtHoveredStateId = null;
      });
    });
  });
  useEffect(() => {
    if (map.current) {
      (map as any).current.flyTo({
        center: [country['Longitude (average)'], country['Latitude (average)']],
      }); // starting position [lng, lat]
      if (selectedLayer === 'hrea') {
        (map as any).current.setStyle({
          version: 8,
          sources: {
            admin2: {
              type: 'vector',
              tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/adm2_polygons/{z}/{x}/{y}.pbf'],
            },
          },
          layers: [
            {
              id: 'admin2b',
              type: 'fill',
              source: 'admin2',
              'source-layer': 'adm2_polygons',
              paint: {
                'fill-color': '#FFFFFF',
                'fill-opacity': 1,
                'fill-outline-color': 'hsla(0, 0%, 50%, 0.9)',
              },
              filter: ['!=', 'adm0_name', country['Country or Area']],
              minzoom: 0,
              maxzoom: 22,
            },
            {
              id: 'admin2',
              type: 'line',
              source: 'admin2',
              'source-layer': 'adm2_polygons',
              paint: {
                'line-color': 'hsla(0, 0%, 50%, 0.9)',
              },
              minzoom: 0,
              maxzoom: 22,
            },
            {
              id: 'admin2a',
              type: 'fill',
              source: 'admin2',
              'source-layer': 'adm2_polygons',
              paint: {
                'fill-color': [
                  'case',
                  ['==', ['get', `hrea_${year}`], ''],
                  'hsla(0, 0%, 0%, 0)',
                  [
                    'interpolate',
                    ['linear'],
                    ['get', `hrea_${year}`],
                    0, colorScale[10],
                    0.0999, colorScale[10],
                    0.1, colorScale[9],
                    0.1999, colorScale[9],
                    0.2, colorScale[8],
                    0.2999, colorScale[8],
                    0.3, colorScale[7],
                    0.3999, colorScale[7],
                    0.4, colorScale[6],
                    0.4999, colorScale[6],
                    0.5, colorScale[5],
                    0.5999, colorScale[5],
                    0.6, colorScale[4],
                    0.6999, colorScale[4],
                    0.7, colorScale[3],
                    0.7999, colorScale[3],
                    0.8, colorScale[2],
                    0.8999, colorScale[2],
                    0.9, colorScale[1],
                    0.9999, colorScale[1],
                    1, colorScale[0],
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
          ],
        });
      } else {
        (map as any).current.setStyle({
          version: 8,
          sources: {
            overlay: {
              type: 'vector',
              tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/poverty_points/{z}/{x}/{y}.pbf'],
              maxzoom: 10,
            },
            admin2: {
              type: 'vector',
              tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/adm2_polygons/{z}/{x}/{y}.pbf'],
            },
          },
          layers: [
            {
              id: 'overlay',
              type: 'heatmap',
              source: 'overlay',
              'source-layer': 'poverty_points',
              paint: {
                'heatmap-weight': ['interpolate', ['exponential', 2], ['get', 'poverty'], 0, 0, 2.022, 1],
                'heatmap-intensity': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 10, 5],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 30],
              },
            },
            {
              id: 'admin2',
              type: 'line',
              source: 'admin2',
              'source-layer': 'adm2_polygons',
              paint: {
                'line-color': 'hsla(0, 0%, 50%, 0.9)',
              },
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        });
      }
    }
  }, [country, selectedLayer]);
  return (
    <div>
      <Radio.Group defaultValue={selectedLayer}>
        <Radio
          className='undp-radio'
          value='hrea'
          onChange={(e) => { setSelectedLayer(e.target.value); }}
        >
          High resolution electricity access
        </Radio>
        <Radio
          className='undp-radio'
          value='poverty'
          onChange={(e) => { setSelectedLayer(e.target.value); }}
        >
          Poverty heatmap
        </Radio>
      </Radio.Group>
      <div id='map' style={{ height: '400px', width: '100%', backgroundColor: '#F7F7F7' }} />
      {
        hoverData ? <CountryMapTooltip district={hoverData.district} country={hoverData.country} popValue={hoverData.popValue} pctValue={hoverData.pctValue} xPosition={hoverData.xPosition} yPosition={hoverData.yPosition} /> : null
      }
    </div>
  );
};
