import maplibreGl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { CountryGroupDataType } from '../Types';
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

interface Props {
  country: CountryGroupDataType;
}

export const CountryMap = (props: Props) => {
  const {
    country,
  } = props;
  const year = 2020;
  const map = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (map.current) return;
    console.log('country ------ ', country);
    // initiate map and add base layer

    // map.on('mousemove', 'admin2a', (d:any) => console.log('mousemove', d.features[0].properties.adm0_name, d.features[0].properties.adm2_name, d.features[0].properties.hrea_2020, d.features[0].properties.pop_hrea_2020));
    // console.log('map', map);
    (map as any).current = new maplibreGl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          admin2: {
            type: 'vector',
            tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/adm2_polygons/{z}/{x}/{y}.pbf'],
            attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://carto.com/">CartoDB</a>',
          },
          overlay: {
            type: 'vector',
            tiles: ['https://undpngddlsgeohubdev01.blob.core.windows.net/admin/poverty_points/{z}/{x}/{y}.pbf'],
            maxzoom: 10,
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
            filter: ['has', 'hrea_2020'],
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
                  0,
                  ['to-color', '#d7191c'],
                  0.25,
                  ['to-color', '#fdae61'],
                  0.5,
                  ['to-color', '#ffffbf'],
                  0.75,
                  ['to-color', '#abd9e9'],
                  1,
                  ['to-color', '#2c7bb6'],
                ],
              ],
              'fill-opacity': 0.5,
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
        ],
      },
      center: [country['Longitude (average)'], country['Latitude (average)']],
      zoom: 4, // starting zoom
    });
  });
  useEffect(() => {
    console.log('country changed +++++', country);
    if (map.current) {
      (map as any).current.flyTo({
        center: [country['Longitude (average)'], country['Latitude (average)']],
      }); // starting position [lng, lat]
    }
  }, [country]);
  return (
    <div id='map' style={{ height: '400px', width: '100%' }}> </div>
  );
};
