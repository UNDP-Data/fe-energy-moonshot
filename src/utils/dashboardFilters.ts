import {
  AppliedFilterIntent,
  CountryMetadataRow,
  DashboardFilterKey,
  DashboardFilters,
  FilterCatalog,
  FilterOption,
  ProjectLevelDataType,
  RankedProject,
} from '../Types';
import { genderMarkers, outputsTaxonomy } from '../Constants';
import semanticAliasControls from '../config/filterSemanticAliases.json';

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  funding: 'all',
  genderMarker: 'all',
  category: 'all',
  subCategory: 'all',
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

// Current moonshotData.json contains a few records that diverge from the
// archived dataset used by the original dashboard. We normalize them at load
// time so totals, category splits, and summaries stay aligned with the
// historical source of truth the dashboard previously used.
const OUTPUT_OVERRIDES: Record<string, Partial<any>> = {
  'DZA-6163-Waste-0': {
    directBeneficiaries: 35000,
  },
  'EGY-4998-Solar-0': {
    outputCategory: 'Energy Transition',
    beneficiaryCategory: 'Solar',
    mwAdded: 18,
    directBeneficiaries: 315000,
  },
  'EGY-4998-CleanElectricity-0': {
    outputCategory: 'Energy Transition',
    beneficiaryCategory: 'Solar',
    mwAdded: 18,
    directBeneficiaries: 315000,
  },
  'EGY-6249-Solar-0': {
    outputCategory: 'Energy Transition',
    beneficiaryCategory: 'Solar',
    mwAdded: 1,
    directBeneficiaries: 17500,
  },
  'EGY-6249-CleanElectricity-0': {
    outputCategory: 'Energy Transition',
    beneficiaryCategory: 'Solar',
    mwAdded: 1,
    directBeneficiaries: 17500,
  },
};

const normalizeText = (value: string | null | undefined) => (
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
);

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number((value || '').toString().replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const hasFlag = (value: string | null | undefined) => normalizeText(value) !== '';

const createOption = (value: string, label = value, aliases: string[] = []) => ({
  value,
  label,
  aliases: Array.from(new Set([value, label, ...aliases].map(normalizeText).filter(Boolean))),
});

const PREFERRED_BUREAU_ALIASES: Record<string, string[]> = {
  RBA: [
    'africa',
    'african',
    'african region',
    'regional bureau for africa',
    'sub saharan africa',
    'sub-saharan africa',
  ],
  RBLAC: [
    'latin america',
    'latin american',
    'latin america and the caribbean',
    'latin american and the caribbean',
    'latin america or latin american and the caribbean',
    'latin america caribbean',
    'latin america & caribbean',
    'lac',
    'caribbean',
    'rblac',
  ],
  RBAS: [
    'arab states',
    'arab state',
    'arab region',
    'arab countries',
    'regional bureau for arab states',
    'rbas',
  ],
  RBEC: [
    'eastern europe',
    'cis',
    'eastern europe and cis',
    'eastern europe cis',
    'europe and cis',
    'commonwealth of independent states',
    'regional bureau for europe and cis',
    'rbec',
  ],
  RBAP: [
    'asia',
    'asian',
    'asia pacific',
    'asia-pacific',
    'asia and the pacific',
    'asian pacific',
    'pacific',
    'regional bureau for asia and the pacific',
    'rbap',
  ],
};

const createBureauOption = (value: string) => (
  createOption(value, value, PREFERRED_BUREAU_ALIASES[value] || [])
);

const SUBCATEGORY_ALIASES: Record<string, string[]> = {
  'Clean Cooking': [
    'clean cooking',
    'cooking',
    'cookstove',
    'cookstoves',
    'clean cookstove',
    'clean cookstoves',
    'improved cookstove',
    'improved cookstoves',
  ],
  'Clean Electricity': [
    'clean electricity',
    'electricity access',
    'electricity',
    'energy access electricity',
    'power access',
    'clean power',
    'electrification',
  ],
  'Productive Use': [
    'productive use',
    'productive uses',
    'productive use of energy',
    'pue',
  ],
  Solar: ['solar', 'solar pv', 'pv'],
  Wind: ['wind', 'wind power'],
  Hydro: ['hydro', 'hydropower'],
  Geothermal: ['geothermal'],
  Bioenergy: ['bioenergy', 'biomass'],
  Efficiency: ['efficiency', 'energy efficiency'],
  'Policy - Clean Cooking': ['clean cooking policy', 'policy clean cooking', 'clean cookstove policy'],
  'Policy - Electricity Access': ['electricity access policy', 'energy access policy', 'policy electricity access'],
  'Policy - Renewable Energy': ['renewable energy policy', 'renewables policy', 'policy renewable energy'],
  'Policy - Energy Efficiency': ['energy efficiency policy', 'efficiency policy', 'policy energy efficiency'],
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  'Energy Access': [
    'energy access',
    'access',
  ],
  'Energy Transition': [
    'energy transition',
    'transition',
    'renewable energy',
    'renewables',
  ],
  Policy: [
    'policy',
    'policies',
    'regulation',
    'regulatory',
  ],
};

const sortOptions = (options: FilterOption[]) => [...options].sort((left, right) => (
  left.label.localeCompare(right.label)
));

interface SemanticAliasControl {
  filterKey: string;
  value: string;
  aliases: string[];
}

const isDashboardFilterKey = (value: string): value is DashboardFilterKey => (
  Object.prototype.hasOwnProperty.call(DEFAULT_DASHBOARD_FILTERS, value)
);

const applySemanticAliasControls = (filterCatalog: FilterCatalog): FilterCatalog => {
  const controls = (semanticAliasControls as { aliases?: SemanticAliasControl[] }).aliases || [];
  const optionsByKey = Object.fromEntries(
    (Object.keys(filterCatalog.optionsByKey) as DashboardFilterKey[]).map((key) => [
      key,
      filterCatalog.optionsByKey[key].map((option) => ({ ...option, aliases: [...option.aliases] })),
    ]),
  ) as Record<DashboardFilterKey, FilterOption[]>;

  controls.forEach((control) => {
    if (!isDashboardFilterKey(control.filterKey) || !Array.isArray(control.aliases)) return;
    const option = optionsByKey[control.filterKey].find((item) => item.value === control.value);
    if (!option) return;
    option.aliases = Array.from(new Set([
      ...option.aliases,
      ...control.aliases.map(normalizeText).filter(Boolean),
    ]));
  });

  return { optionsByKey };
};

export const normalizeFundingValue = (value: string) => {
  const normalized = normalizeText(value);
  if (normalized === 'vertical funds' || normalized === 'vf') return 'vf';
  if (normalized === 'non vertical funds' || normalized === 'non-vf' || normalized === 'non vf') return 'non-vf';
  return 'all';
};

export const normalizeGenderMarkerValue = (value: string | null | undefined) => {
  const normalized = (value || '').trim();
  if (!normalized) return 'no-marker';
  return normalized;
};

export const normalizeCountryMetadata = (rows: any[]): CountryMetadataRow[] => rows.map((row) => ({
  'Country Name': row['Country Name'] || '',
  'Country Code': row['Country Code'] || '',
  Region: row.Region || '',
  Economy: row.Economy || '',
  HDI: row.HDI || '',
  LDC: row.LDC || '',
  SIDS: row.SIDS || '',
  LLDC: row.LLDC || '',
  Sahel: row.Sahel || '',
  Crisis: row.Crisis || '',
  'continent-region': row['continent-region'] || '',
  'sub-region': row['sub-region'] || '',
  'Project Count': toNumber(row['Project Count']),
  'Output Count': toNumber(row['Output Count']),
  'Budget Total': toNumber(row['Budget Total']),
  'Direct Beneficiaries': toNumber(row['Direct Beneficiaries']),
}));

export const normalizeProjectLevelData = (projects: any[]): ProjectLevelDataType[] => projects.map((project) => ({
  ...project,
  outputs: (project.outputs || []).map((output: any) => {
    const override = OUTPUT_OVERRIDES[output.id];
    if (!override) return output;
    return {
      ...output,
      ...override,
    };
  }),
}));

export const buildCountryMetadataMap = (rows: CountryMetadataRow[]) => rows.reduce((accum, row) => ({
  ...accum,
  [row['Country Code']]: row,
}), {} as Record<string, CountryMetadataRow>);

export const getProjectDirectBeneficiaries = (project: ProjectLevelDataType) => (
  (project.outputs || []).reduce((sum, output) => sum + toNumber(output.directBeneficiaries), 0)
);

export const getProjectBudget = (project: ProjectLevelDataType) => toNumber(project.budget);

export const outputMatchesFilters = (
  output: any,
  filters: DashboardFilters,
) => {
  const { category, subCategory } = filters;

  if (category === 'all') return true;

  if (category === 'Energy Access' && subCategory === 'Clean Electricity') {
    return (
      (output.outputCategory === 'Energy Access' && output.beneficiaryCategory === 'Clean Electricity')
      || output.outputCategory === 'Energy Transition'
    );
  }

  if (output.outputCategory !== category) return false;
  return subCategory === 'all' || output.beneficiaryCategory === subCategory;
};

export const getProjectDirectBeneficiariesForFilters = (
  project: ProjectLevelDataType,
  filters: DashboardFilters,
) => (project.outputs || []).reduce((sum, output) => (
  outputMatchesFilters(output, filters) ? sum + toNumber(output.directBeneficiaries) : sum
), 0);

export const getPrimaryOutputCategories = (
  project: ProjectLevelDataType,
  filters: DashboardFilters = DEFAULT_DASHBOARD_FILTERS,
) => Array.from(new Set(
  (project.outputs || [])
    .filter((output) => outputMatchesFilters(output, filters))
    .map((output) => output.outputCategory)
    .filter(Boolean),
));

export const getProjectTitle = (project: ProjectLevelDataType) => (
  project.title
  || project.projectTitle
  || project['Short Title']
  || project.id
);

export const projectMatchesOutputFilters = (
  project: ProjectLevelDataType,
  filters: DashboardFilters,
) => (project.outputs || []).some((output) => outputMatchesFilters(output, filters));

export const projectMatchesFilters = (
  project: ProjectLevelDataType,
  filters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
) => {
  const metadata = countryMetadataByCode[project.countryCode];
  const genderMarker = normalizeGenderMarkerValue(project.genderMarker);

  if (filters.funding !== 'all') {
    const normalizedFunding = project.verticalFunded ? 'vf' : 'non-vf';
    if (normalizedFunding !== filters.funding) return false;
  }

  if (filters.genderMarker !== 'all' && genderMarker !== filters.genderMarker) return false;
  if (filters.countryCode !== 'all' && project.countryCode !== filters.countryCode) return false;
  if (filters.bureau !== 'all' && (metadata?.Region || project.region) !== filters.bureau) return false;
  if (filters.economy !== 'all' && (metadata?.Economy || project.incomeGroup) !== filters.economy) return false;
  if (filters.hdiTier !== 'all' && (metadata?.HDI || project.hdiTier) !== filters.hdiTier) return false;
  if (filters.continentRegion !== 'all' && metadata?.['continent-region'] !== filters.continentRegion) return false;
  if (filters.subRegion !== 'all' && metadata?.['sub-region'] !== filters.subRegion) return false;
  if (filters.sahel !== 'all' && !hasFlag(metadata?.Sahel)) return false;
  if (filters.crisis !== 'all' && !hasFlag(metadata?.Crisis)) return false;

  if (filters.specialGrouping !== 'all') {
    if (filters.specialGrouping === 'Other') {
      if (hasFlag(metadata?.LDC) || hasFlag(metadata?.SIDS) || hasFlag(metadata?.LLDC)) return false;
    } else if (!hasFlag((metadata as any)?.[filters.specialGrouping]) && !(project.specialGroupings || []).includes(filters.specialGrouping)) {
      return false;
    }
  }

  return projectMatchesOutputFilters(project, filters);
};

export const filterProjects = (
  projects: ProjectLevelDataType[],
  filters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
) => projects.filter((project) => projectMatchesFilters(project, filters, countryMetadataByCode));

export const rankProjects = (
  projects: ProjectLevelDataType[],
  filters: DashboardFilters = DEFAULT_DASHBOARD_FILTERS,
): RankedProject[] => [...projects]
  .map((project) => ({
    id: project.id,
    title: getProjectTitle(project),
    link: project.link || '',
    countryName: project.countryName,
    description: project.description || project.projectDescription || '',
    budget: getProjectBudget(project),
    directBeneficiaries: getProjectDirectBeneficiariesForFilters(project, filters),
    primaryOutputCategories: getPrimaryOutputCategories(project, filters),
  }))
  .sort((left, right) => (
    right.budget - left.budget
    || right.directBeneficiaries - left.directBeneficiaries
    || left.title.localeCompare(right.title)
  ));

const uniqueMetadataOptions = (
  rows: CountryMetadataRow[],
  mapper: (_row: CountryMetadataRow) => FilterOption | null,
) => {
  const seen = new Set<string>();
  return sortOptions(rows.reduce((accum: FilterOption[], row) => {
    const option = mapper(row);
    if (!option || seen.has(option.value)) return accum;
    seen.add(option.value);
    accum.push(option);
    return accum;
  }, []));
};

export const buildFilterCatalog = (countryMetadata: CountryMetadataRow[]): FilterCatalog => {
  const categoryOptions = outputsTaxonomy
    .filter((category) => category.value !== 'all')
    .map((category) => createOption(
      category.value,
      category.value,
      [category.label, ...(CATEGORY_ALIASES[category.value] || [])],
    ));

  const subCategoryOptions = outputsTaxonomy.flatMap((category) => category.subcategories
    .filter((subCategory) => subCategory.value !== 'all')
    .map((subCategory) => createOption(
      subCategory.value,
      subCategory.value,
      [
        subCategory.label,
        `${category.value} ${subCategory.value}`,
        ...(SUBCATEGORY_ALIASES[subCategory.value] || []),
      ],
    )));

  const genderOptions = genderMarkers
    .filter((marker) => marker.value !== 'all')
    .map((marker) => createOption(marker.value, marker.value, [marker.label]));

  genderOptions.push(createOption('no-marker', 'No marker', ['no marker', 'without marker']));

  return applySemanticAliasControls({
    optionsByKey: {
      funding: [
        createOption('vf', 'Vertical funds', ['vf', 'vertical fund', 'vertical funds']),
        createOption('non-vf', 'Non Vertical funds', ['non-vf', 'non vf', 'non vertical funds']),
      ],
      genderMarker: sortOptions(genderOptions),
      category: sortOptions(categoryOptions),
      subCategory: sortOptions(subCategoryOptions),
      bureau: uniqueMetadataOptions(countryMetadata, (row) => (
        row.Region ? createBureauOption(row.Region) : null
      )),
      economy: uniqueMetadataOptions(countryMetadata, (row) => (
        row.Economy ? createOption(row.Economy, row.Economy) : null
      )),
      hdiTier: uniqueMetadataOptions(countryMetadata, (row) => (
        row.HDI ? createOption(row.HDI, row.HDI) : null
      )),
      specialGrouping: [
        createOption('LDC', 'LDC', ['ldcs']),
        createOption('LLDC', 'LLDC', ['lldcs']),
        createOption('SIDS', 'SIDS', ['small island developing states']),
        createOption('Other', 'Other', ['other']),
      ],
      continentRegion: uniqueMetadataOptions(countryMetadata, (row) => (
        row['continent-region']
          ? createOption(row['continent-region'], row['continent-region'])
          : null
      )),
      subRegion: uniqueMetadataOptions(countryMetadata, (row) => (
        row['sub-region'] ? createOption(row['sub-region'], row['sub-region']) : null
      )),
      sahel: [createOption('yes', 'Sahel', ['sahel'])],
      crisis: [createOption('yes', 'Crisis', ['crisis'])],
      countryCode: uniqueMetadataOptions(countryMetadata, (row) => (
        row['Country Code']
          ? createOption(
            row['Country Code'],
            row['Country Name'],
            [row['Country Code'], row['Country Name']],
          )
          : null
      )),
    },
  });
};

const tokenizeQuery = (query: string) => normalizeText(query).split(/[^a-z0-9-]+/).filter(Boolean);

const findBestMatchedOption = (
  options: FilterOption[],
  normalizedQuery: string,
) => options.reduce(
  (bestMatch: { option: FilterOption; aliasLength: number } | undefined, option) => {
    const matchedAliasLength = option.aliases.reduce((maxLength, alias) => (
      normalizedQuery.includes(alias) ? Math.max(maxLength, alias.length) : maxLength
    ), 0);
    if (!matchedAliasLength) return bestMatch;
    if (!bestMatch || matchedAliasLength > bestMatch.aliasLength) {
      return { option, aliasLength: matchedAliasLength };
    }
    return bestMatch;
  },
  undefined,
)?.option;

export const parseQueryLocally = (
  query: string,
  filterCatalog: FilterCatalog,
): AppliedFilterIntent => {
  const normalizedQuery = normalizeText(query);
  const tokens = tokenizeQuery(query);
  const filters: Partial<DashboardFilters> = {};

  (Object.keys(filterCatalog.optionsByKey) as DashboardFilterKey[]).forEach((key) => {
    const matchedOption = findBestMatchedOption(filterCatalog.optionsByKey[key], normalizedQuery);

    if (matchedOption) {
      filters[key] = matchedOption.value;
    }
  });

  if (filters.bureau) {
    const countryWasExplicit = filterCatalog.optionsByKey.countryCode.some((option) => (
      option.aliases.some((alias) => normalizedQuery.includes(alias))
    ));
    if (!countryWasExplicit) {
      delete filters.countryCode;
    }
  }

  if (filters.subCategory && !filters.category) {
    const matchedCategory = outputsTaxonomy.find((category) => category.subcategories
      .some((subCategory) => subCategory.value === filters.subCategory));
    if (matchedCategory) {
      filters.category = matchedCategory.value;
    }
  }

  const unresolvedTerms = tokens.filter((token) => !Object.values(filterCatalog.optionsByKey)
    .flat()
    .some((option) => option.aliases.some((alias) => alias.includes(token))));

  return {
    filters,
    unresolvedTerms: Array.from(new Set(unresolvedTerms)).slice(0, 8),
  };
};

export const getFilterDisplayValue = (
  filterKey: DashboardFilterKey,
  value: string,
  filterCatalog: FilterCatalog,
) => {
  const option = filterCatalog.optionsByKey[filterKey].find((item) => item.value === value);
  return option?.label || value;
};

export const getAppliedFilterEntries = (
  filters: DashboardFilters,
  filterCatalog: FilterCatalog,
) => (Object.keys(filters) as DashboardFilterKey[])
  .filter((key) => filters[key] !== 'all')
  .map((key) => ({
    key,
    value: filters[key],
    label: getFilterDisplayValue(key, filters[key], filterCatalog),
  }));

export const getMoonshotProxyBaseUrl = () => (
  process.env.REACT_APP_MOONSHOT_PROXY_BASE_URL
  || process.env.REACT_APP_ASSISTANT_PROXY_BASE_URL
  || ''
);

export const isKnownFilterKey = (value: string): value is DashboardFilterKey => (
  Object.prototype.hasOwnProperty.call(DEFAULT_DASHBOARD_FILTERS, value)
);
