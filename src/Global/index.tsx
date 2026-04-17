import { useContext, useEffect, useState } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CountryMetadataRow,
  CtxDataType,
  DataType,
  FilterCatalog,
  IndicatorMetaDataType,
  IndicatorRange,
  ProjectLevelDataType,
} from '../Types';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { BarFilters } from './BarFilters';
import { UnivariateMap } from './UnivariateMap';
import { DataTable } from './DataTable';
import { QueryAssistantPanel } from './QueryAssistantPanel';
import { isAssistantAvailable } from '../utils/assistant';
import {
  buildCountryMetadataMap,
  filterProjects,
  getProjectDirectBeneficiariesForFilters,
  outputMatchesFilters,
  rankProjects,
} from '../utils/dashboardFilters';
import {
  buildProjectSynopsisContext,
  buildSummaryMetrics,
  generateDeterministicSummary,
} from '../utils/summary';

interface Props {
  countryGroupData: CountryGroupDataType[];
  countryMetadata: CountryMetadataRow[];
  filterCatalog: FilterCatalog;
  indicators: IndicatorMetaDataType[];
  geojsonMapData: any[];
  countryLinkDict: any;
  projectLevelData: ProjectLevelDataType[];
}

const buildCountryFallback = (
  countryCode: string,
  project: ProjectLevelDataType,
  metadata: CountryMetadataRow | undefined,
) => ({
  'Alpha-2 code': '',
  'Alpha-3 code': countryCode,
  'Country or Area': metadata?.['Country Name'] || project.countryName || project.country || countryCode,
  'Development classification': '',
  'Group 1': '',
  'Group 2': '',
  'Group 3': '',
  LDC: `${metadata?.LDC || ''}`.trim() !== '',
  LLDC: `${metadata?.LLDC || ''}`.trim() !== '',
  'Latitude (average)': 0,
  'Longitude (average)': 0,
  'Numeric code': 0,
  SIDS: `${metadata?.SIDS || ''}`.trim() !== '',
  'Income group': metadata?.Economy || project.incomeGroup || '',
  bbox: {
    sw: { lat: 0, lon: 0 },
    ne: { lat: 0, lon: 0 },
  },
});

export const Global = (props: Props) => {
  const {
    countryGroupData,
    countryMetadata,
    filterCatalog,
    indicators,
    geojsonMapData,
    projectLevelData,
    countryLinkDict,
  } = props;
  const { filters } = useContext(Context) as CtxDataType;
  const [assistantAvailable, setAssistantAvailable] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAssistant = async () => {
      const available = await isAssistantAvailable();
      if (active) {
        setAssistantAvailable(available);
      }
    };

    checkAssistant();

    return () => {
      active = false;
    };
  }, []);

  const countryMetadataByCode = buildCountryMetadataMap(countryMetadata);
  const filteredProjectData = filterProjects(projectLevelData, filters, countryMetadataByCode);

  const availableCountryList = Array.from(new Set(filteredProjectData.map((project) => project.countryCode)));
  const rankedProjects = rankProjects(filteredProjectData, filters);
  const summaryMetrics = buildSummaryMetrics(filteredProjectData, filters, countryMetadataByCode);
  const summaryText = generateDeterministicSummary(summaryMetrics, filters, countryMetadataByCode);
  const projectSynopsisContext = buildProjectSynopsisContext(filteredProjectData, filters);

  const calculateCountryTotals = () => {
    const groupedData = nest()
      .key((project: any) => project.countryCode)
      .entries(filteredProjectData);

    return groupedData.map((country: any) => {
      const firstProject = country.values[0] as ProjectLevelDataType;
      const metadata = countryMetadataByCode[country.key];
      const countryGroup = countryGroupData.find((row) => row['Alpha-3 code'] === country.key)
        || buildCountryFallback(country.key, firstProject, metadata);
      const region = firstProject.region || metadata?.Region || '';
      const numberOfProjects = country.values.length;

      const indicatorValues = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;

        if (indicator.AggregationLevel === 'outputs') {
          return {
            indicator: indicatorName,
            value: sumBy(country.values, (project: ProjectLevelDataType) => (
            sumBy(project.outputs || [], (output: any) => (
              outputMatchesFilters(output, filters) ? Number(output[indicatorName] || 0) : 0
            ))
            )),
          };
        }

        if (indicatorName === 'directBeneficiaries') {
          return {
            indicator: indicatorName,
            value: sumBy(country.values, (project: ProjectLevelDataType) => (
              getProjectDirectBeneficiariesForFilters(project, filters)
            )),
          };
        }

        return {
          indicator: indicatorName,
          value: sumBy(country.values, (project: ProjectLevelDataType) => Number(project[indicatorName as keyof ProjectLevelDataType] || 0)),
        };
      });

      const projectCountIndex = indicatorValues.findIndex((indicator) => indicator.indicator === 'nProj');
      if (projectCountIndex !== -1) {
        indicatorValues[projectCountIndex].value = numberOfProjects;
      }

      return {
        ...countryGroup,
        region,
        indicatorsAvailable: indicatorValues.map((indicator) => indicator.indicator),
        indicators: indicatorValues,
        numberProjects: numberOfProjects,
      } as DataType;
    });
  };

  const mapData = calculateCountryTotals();
  const countryList = projectLevelData.reduce((accum: string[], projectData) => {
    if (!accum.includes(projectData.countryCode)) {
      accum.push(projectData.countryCode);
    }
    return accum;
  }, []);

  const calculateRanges = () => {
    const ranges: IndicatorRange = mapData.reduce((accum: IndicatorRange, country) => {
      country.indicatorsAvailable.forEach((indicatorName: string) => {
        const value = country.indicators.find((indicator) => indicator.indicator === indicatorName);
        if (value && typeof value.value === 'number') {
          accum[indicatorName].push(value.value);
        }
      });
      return accum;
    }, indicators.reduce((accum, indicator: IndicatorMetaDataType) => ({
      ...accum,
      [indicator.DataKey]: [],
    }), {} as IndicatorRange));

    indicators.forEach((indicator: IndicatorMetaDataType) => {
      ranges[indicator.DataKey].sort((left: number, right: number) => left - right);
      const q = Math.ceil((ranges[indicator.DataKey].length - 1) / 9);
      let i = 1;
      const legendArray = [];

      if (!ranges[indicator.DataKey].length || q <= 0) {
        ranges[indicator.DataKey] = [0];
        return;
      }

      do {
        const currentValue = ranges[indicator.DataKey][i * q];
        const numstr = Math.ceil(currentValue || 0).toString();
        const num = parseInt(numstr[0] + '0'.repeat(Math.max(numstr.length - 1, 0)), 10);
        legendArray.push(num);
        i += 1;
      } while (i * q < ranges[indicator.DataKey].length - 1);

      ranges[indicator.DataKey] = Array.from(new Set(legendArray.length ? legendArray : [0]));
    });

    return ranges;
  };

  const binningRangeLarge = calculateRanges();

  return (
    <>
      <div id='tracker' className='flex-div flex-wrap padding-top-06'>
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <h2 className='undp-typography margin-bottom-05 page-title'>
            <span style={{ color: 'var(--dark-yellow)' }}>
              Energy Moonshot
            </span>
            {' '}
            Tracker
          </h2>
          <h5 className='undp-typography'>
            Select filters to analyze beneficiary targets of
            {' '}
            <b>
              UNDP energy-related projects
            </b>
            {' '}
            active during the Strategic Plan
            {' '}
            <b>
              2022-2025:
            </b>
            {' '}
          </h5>
          {assistantAvailable ? (
            <QueryAssistantPanel
              filterCatalog={filterCatalog}
              filteredProjects={filteredProjectData}
              rankedProjects={rankedProjects}
              projectSynopsisContext={projectSynopsisContext}
              summaryMetrics={summaryMetrics}
              summaryText={summaryText}
            />
          ) : null}
          <Settings />
          <div>
            <Cards data={mapData} />
          </div>
          <div className='flex-div'>
            <div style={{ maxWidth: '30%', width: '30%' }}>
              <BarFilters
                data={filteredProjectData}
                countryList={countryList}
                countryMetadataByCode={countryMetadataByCode}
              />
            </div>
            <div style={{ maxWidth: '70%', width: '70%' }}>
              <div style={{ backgroundColor: 'var(--gray-200)' }}>
                <UnivariateMap
                  availableCountryList={availableCountryList}
                  geojsonMapData={geojsonMapData}
                  data={mapData}
                  indicators={indicators}
                  binningRangeLarge={binningRangeLarge}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className='undp-style light' />
      <div>
        <DataTable countryLinkDict={countryLinkDict} projects={filteredProjectData} />
      </div>
    </>
  );
};
