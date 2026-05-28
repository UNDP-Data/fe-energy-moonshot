import {
  CountryMetadataRow,
  DashboardFilters,
  FilterCatalog,
  ProjectLevelDataType,
  SummaryMetrics,
} from '../Types';
import {
  getAppliedFilterEntries,
  getProjectBudget,
  getProjectDirectBeneficiariesForFilters,
  outputMatchesFilters,
} from './dashboardFilters';

type WorkbookRow = Record<string, string | number>;
type XlsxModule = typeof import('xlsx');

interface ExportWorkbookArgs {
  countryMetadataByCode: Record<string, CountryMetadataRow>;
  filterCatalog: FilterCatalog;
  filters: DashboardFilters;
  projects: ProjectLevelDataType[];
  summaryMetrics: SummaryMetrics;
  summaryText: string;
}

const textValue = (value: unknown) => {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return '';
  return `${value}`;
};

const numberValue = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(`${value || ''}`.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const fundingLabel = (isVerticalFunded: boolean) => (isVerticalFunded ? 'VF' : 'Non-VF');

const slugifyFilenamePart = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'all-filters';
};

export const buildFilteredWorkbookFilename = (args: ExportWorkbookArgs) => {
  const date = new Date().toISOString().slice(0, 10);
  const appliedFilters = getAppliedFilterEntries(args.filters, args.filterCatalog);
  const filterSlug = appliedFilters.length
    ? appliedFilters.map((filter) => slugifyFilenamePart(filter.label)).join('_')
    : 'all-projects';
  return `sustainable-energy-tracker-${filterSlug}-${date}.xlsx`;
};

const NON_PRODUCTIVE_BENEFICIARY_CATEGORIES = new Set([
  'Clean Electricity',
  'Clean Cooking',
  'Other',
  'Some Sources',
]);

const PREFERRED_BUREAU_ORDER = ['RBLAC', 'RBA', 'RBAS', 'RBEC', 'RBAP'];
const PREFERRED_SPECIAL_GROUP_ORDER = ['SIDS', 'LDC', 'LLDC', 'Sahel', 'Crisis'];
const PREFERRED_ECONOMY_ORDER = [
  'Low income',
  'Lower middle income',
  'Upper middle income',
  'High income',
];
const PREFERRED_HDI_ORDER = ['Low', 'Medium', 'High', 'Very High'];
const PREFERRED_TIER_ORDER = [
  'Access to Energy',
  'Productive Use of Energy',
  'Market Development',
  'Capacity Building',
  'Policy and Regulator Frameworks',
  'Other',
];

const addSheet = (
  xlsx: XlsxModule,
  workbook: import('xlsx').WorkBook,
  sheetName: string,
  rows: WorkbookRow[],
  columnWidths: number[],
) => {
  const worksheet = xlsx.utils.json_to_sheet(rows);
  worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
};

export const buildSummaryRows = ({
  countryMetadataByCode,
  filters,
  projects,
}: ExportWorkbookArgs): WorkbookRow[] => buildAggregateSummaryRows(
  projects,
  filters,
  countryMetadataByCode,
);

interface SummaryRegionGroup {
  label: string;
  matcher: (_project: ProjectLevelDataType) => boolean;
}

interface SummaryDimension {
  category: string;
  subcategory: string;
  matcher: (_project: ProjectLevelDataType, _output: any) => boolean;
}

const uniqueByPreferredOrder = (
  values: string[],
  preferredOrder: string[],
) => {
  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  return [
    ...preferredOrder.filter((value) => uniqueValues.includes(value)),
    ...uniqueValues
      .filter((value) => !preferredOrder.includes(value))
      .sort((left, right) => left.localeCompare(right)),
  ];
};

const isEnergyAccessOutput = (output: any) => (
  output.outputCategory === 'Energy Transition'
  || (
    output.outputCategory === 'Energy Access'
    && ['Clean Electricity', 'Clean Cooking'].includes(textValue(output.beneficiaryCategory))
  )
);

const isProductiveUseOutput = (output: any) => (
  output.outputCategory === 'Energy Access'
  && !NON_PRODUCTIVE_BENEFICIARY_CATEGORIES.has(textValue(output.beneficiaryCategory))
);

const getBeneficiaryTier = (output: any) => {
  if (isEnergyAccessOutput(output)) return 'Access to Energy';
  if (isProductiveUseOutput(output)) return 'Productive Use of Energy';
  if (output.outputCategory === 'Policy') return 'Policy and Regulator Frameworks';
  return textValue(output.outputCategory || 'Other');
};

const buildSummaryRegionGroups = (
  projects: ProjectLevelDataType[],
  countryMetadataByCode: Record<string, CountryMetadataRow>,
): SummaryRegionGroup[] => {
  const metadataForProject = (project: ProjectLevelDataType) => countryMetadataByCode[project.countryCode];
  const bureaus = uniqueByPreferredOrder(
    projects.map((project) => metadataForProject(project)?.Region || project.region),
    PREFERRED_BUREAU_ORDER,
  );
  const continentRegions = uniqueByPreferredOrder(
    projects.map((project) => metadataForProject(project)?.['continent-region'] || ''),
    [],
  );
  const specialGroups = PREFERRED_SPECIAL_GROUP_ORDER.filter((group) => projects.some((project) => {
    const metadata = metadataForProject(project);
    return textValue((metadata as any)?.[group]) || (project.specialGroupings || []).includes(group);
  }));

  return [
    { label: 'All', matcher: () => true },
    ...bureaus.map((bureau) => ({
      label: bureau,
      matcher: (project: ProjectLevelDataType) => (
        (metadataForProject(project)?.Region || project.region) === bureau
      ),
    })),
    ...specialGroups.map((group) => ({
      label: group,
      matcher: (project: ProjectLevelDataType) => (
        Boolean(textValue((metadataForProject(project) as any)?.[group]))
        || (project.specialGroupings || []).includes(group)
      ),
    })),
    ...continentRegions.map((region) => ({
      label: region,
      matcher: (project: ProjectLevelDataType) => metadataForProject(project)?.['continent-region'] === region,
    })),
  ];
};

const buildSummaryDimensions = (
  projects: ProjectLevelDataType[],
  countryMetadataByCode: Record<string, CountryMetadataRow>,
): SummaryDimension[] => {
  const metadataForProject = (project: ProjectLevelDataType) => countryMetadataByCode[project.countryCode];
  const economies = uniqueByPreferredOrder(
    projects.map((project) => metadataForProject(project)?.Economy || project.incomeGroup),
    PREFERRED_ECONOMY_ORDER,
  );
  const hdiTiers = uniqueByPreferredOrder(
    projects.map((project) => metadataForProject(project)?.HDI || project.hdiTier),
    PREFERRED_HDI_ORDER,
  );
  const beneficiaryTiers = uniqueByPreferredOrder(
    projects.flatMap((project) => (project.outputs || []).map(getBeneficiaryTier)),
    PREFERRED_TIER_ORDER,
  );
  const beneficiaryCategories = uniqueByPreferredOrder(
    projects.flatMap((project) => (project.outputs || [])
      .map((output) => textValue(output.beneficiaryCategory || 'Other'))),
    [],
  );

  return [
    {
      category: 'All',
      subcategory: 'All',
      matcher: () => true,
    },
    ...economies.map((economy) => ({
      category: 'Economy',
      subcategory: economy,
      matcher: (project: ProjectLevelDataType) => (
        (metadataForProject(project)?.Economy || project.incomeGroup) === economy
      ),
    })),
    ...hdiTiers.map((hdiTier) => ({
      category: 'HDI',
      subcategory: hdiTier,
      matcher: (project: ProjectLevelDataType) => (
        (metadataForProject(project)?.HDI || project.hdiTier) === hdiTier
      ),
    })),
    ...beneficiaryTiers.map((tier) => ({
      category: 'Beneficiary Tier',
      subcategory: tier,
      matcher: (_project: ProjectLevelDataType, output: any) => getBeneficiaryTier(output) === tier,
    })),
    ...beneficiaryCategories.map((beneficiaryCategory) => ({
      category: 'Beneficiary Category',
      subcategory: beneficiaryCategory,
      matcher: (_project: ProjectLevelDataType, output: any) => (
        textValue(output.beneficiaryCategory || 'Other') === beneficiaryCategory
      ),
    })),
  ];
};

const aggregateSummaryRow = (
  region: SummaryRegionGroup,
  dimension: SummaryDimension,
  funding: 'Total' | 'VF' | 'Non-VF',
  projects: ProjectLevelDataType[],
  filters: DashboardFilters,
) => {
  const matchingProjects = projects.filter((project) => {
    if (!region.matcher(project)) return false;
    if (funding === 'VF' && !project.verticalFunded) return false;
    if (funding === 'Non-VF' && project.verticalFunded) return false;
    return (project.outputs || []).some((output) => (
      outputMatchesFilters(output, filters)
      && dimension.matcher(project, output)
    ));
  });

  const matchingOutputs = matchingProjects.flatMap((project) => (project.outputs || [])
    .filter((output) => (
      outputMatchesFilters(output, filters)
      && dimension.matcher(project, output)
    )));

  const directBeneficiaries = matchingOutputs.reduce((sum, output) => (
    sum + numberValue(output.directBeneficiaries)
  ), 0);
  const energyAccess = matchingOutputs.reduce((sum, output) => (
    isEnergyAccessOutput(output) ? sum + numberValue(output.directBeneficiaries) : sum
  ), 0);
  const productiveUse = matchingOutputs.reduce((sum, output) => (
    isProductiveUseOutput(output) ? sum + numberValue(output.directBeneficiaries) : sum
  ), 0);

  return {
    Region: region.label,
    Category: dimension.category,
    Subcategory: dimension.subcategory,
    'VF or Non-VF': funding,
    'Direct Beneficiaries': directBeneficiaries,
    'Energy Access': energyAccess,
    'Productive Use': productiveUse,
    'Budget Sum (M USD)': matchingProjects.reduce((sum, project) => sum + getProjectBudget(project), 0),
    'Project Count': matchingProjects.length,
    'Country Count': new Set(matchingProjects.map((project) => project.countryCode).filter(Boolean)).size,
  };
};

const buildAggregateSummaryRows = (
  projects: ProjectLevelDataType[],
  filters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
) => {
  const regions = buildSummaryRegionGroups(projects, countryMetadataByCode);
  const dimensions = buildSummaryDimensions(projects, countryMetadataByCode);

  const rows = regions.flatMap((region) => (['Total', 'VF', 'Non-VF'] as const).flatMap((funding) => (
    dimensions
      .map((dimension) => aggregateSummaryRow(region, dimension, funding, projects, filters))
      .filter((row) => (
        row['Project Count'] > 0
        || (row.Region === 'All' && row.Category === 'All' && row.Subcategory === 'All' && row['VF or Non-VF'] === 'Total')
      ))
  )));

  return rows.length ? rows : [
    {
      Region: 'All',
      Category: 'All',
      Subcategory: 'All',
      'VF or Non-VF': 'Total',
      'Direct Beneficiaries': 0,
      'Energy Access': 0,
      'Productive Use': 0,
      'Budget Sum (M USD)': 0,
      'Project Count': 0,
      'Country Count': 0,
    },
  ];
};

export const buildProjectRows = (
  projects: ProjectLevelDataType[],
  filters: DashboardFilters,
): WorkbookRow[] => projects.map((project) => ({
  'Project ID': textValue(project.id),
  'Project Title': textValue(project.title || project.projectTitle || project['Short Title']),
  Budget: getProjectBudget(project),
  Country: textValue(project.countryName || project.country),
  'Country Code': textValue(project.countryCode),
  Link: textValue(project.link),
  Donors: textValue(project.donors),
  'VF or Non-VF': fundingLabel(project.verticalFunded),
  'Output Count': (project.outputs || []).filter((output) => outputMatchesFilters(output, filters)).length,
  'Project Description': textValue(project.description || project.projectDescription || project['Project Description']),
  'Direct Beneficiaries': getProjectDirectBeneficiariesForFilters(project, filters),
  'GHG Emissions Reduction': numberValue((project as any).ghgEmissions),
  Thematics: textValue(project.thematics),
  Flagship: textValue(project.flagship),
  'HDI Tier': textValue(project.hdiTier),
  'Income Group': textValue(project.incomeGroup),
  'Special Groupings': textValue(project.specialGroupings),
  'Gender Marker': textValue(project.genderMarker || 'No marker'),
}));

export const buildOutputRows = (
  projects: ProjectLevelDataType[],
  filters: DashboardFilters,
): WorkbookRow[] => projects.flatMap((project) => (project.outputs || [])
  .filter((output) => outputMatchesFilters(output, filters))
  .map((output) => ({
    'Project ID': textValue(project.id),
    Title: textValue(project.title || project.projectTitle || project['Short Title']),
    Link: textValue(project.link),
    Budget: getProjectBudget(project),
    'Country Code': textValue(project.countryCode),
    'Country Name': textValue(project.countryName || project.country),
    'VF or Non-VF': fundingLabel(project.verticalFunded),
    'Gender Marker': textValue(project.genderMarker || 'No marker'),
    Donors: textValue(project.donors),
    'Output ID': textValue(output.id),
    'Output Category': textValue(output.outputCategory),
    'Beneficiary Category': textValue(output.beneficiaryCategory),
    'Direct Beneficiaries': numberValue(output.directBeneficiaries),
    'MW Added': numberValue(output.mwAdded),
    'Energy Saved': numberValue(output.energySaved),
    Policies: numberValue(output.policies),
    Finance: numberValue(output.finance),
    'Female Beneficiaries (%)': numberValue(output.percentFemale),
    Description: textValue(output.description),
  })));

export const buildCountryRows = ({
  countryMetadataByCode,
  filters,
  projects,
}: ExportWorkbookArgs): WorkbookRow[] => {
  const countries = new Map<string, ProjectLevelDataType[]>();
  projects.forEach((project) => {
    const countryCode = project.countryCode || 'Unknown';
    countries.set(countryCode, [...(countries.get(countryCode) || []), project]);
  });

  return Array.from(countries.entries())
    .map(([countryCode, countryProjects]) => {
      const metadata = countryMetadataByCode[countryCode];
      const firstProject = countryProjects[0];
      return {
        'Country Name': textValue(metadata?.['Country Name'] || firstProject.countryName || firstProject.country),
        'Country Code': countryCode,
        m49: textValue(metadata?.m49),
        'continent-region': textValue(metadata?.['continent-region']),
        'sub-region': textValue(metadata?.['sub-region']),
        'sids-region': textValue(metadata?.['sids-region']),
        'un-member': textValue(metadata?.['un-member']),
        'undp-sids': textValue(metadata?.['undp-sids']),
        'un-region': textValue(metadata?.['un-region']),
        Region: textValue(metadata?.Region || firstProject.region),
        Economy: textValue(metadata?.Economy || firstProject.incomeGroup),
        LDC: textValue(metadata?.LDC),
        SIDS: textValue(metadata?.SIDS),
        LLDC: textValue(metadata?.LLDC),
        HDI: textValue(metadata?.HDI || firstProject.hdiTier),
        Sahel: textValue(metadata?.Sahel),
        Crisis: textValue(metadata?.Crisis),
        'Unnamed: 17': textValue(metadata?.['Unnamed: 17']),
        'Project Count': countryProjects.length,
        'Output Count': countryProjects.reduce((sum, project) => (
          sum + (project.outputs || []).filter((output) => outputMatchesFilters(output, filters)).length
        ), 0),
        'Budget Total': countryProjects.reduce((sum, project) => sum + getProjectBudget(project), 0),
        'Direct Beneficiaries': countryProjects.reduce((sum, project) => (
          sum + getProjectDirectBeneficiariesForFilters(project, filters)
        ), 0),
      };
    })
    .sort((left, right) => `${left['Country Name']}`.localeCompare(`${right['Country Name']}`));
};

export const buildMoonshotResultsWorkbook = async (args: ExportWorkbookArgs) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.utils.book_new();
  workbook.Props = {
    Title: 'Sustainable Energy Tracker Results',
    Subject: 'Filtered dashboard export',
    Author: 'UNDP Sustainable Energy Tracker',
    CreatedDate: new Date(),
  };

  addSheet(xlsx, workbook, 'Summary', buildSummaryRows(args), [
    14, 24, 34, 14, 20, 18, 18, 20, 14, 14,
  ]);
  addSheet(xlsx, workbook, 'Outputs', buildOutputRows(args.projects, args.filters), [
    14, 44, 36, 14, 14, 22, 14, 14, 28, 24, 20, 24, 18, 12, 14, 12, 12, 22, 90,
  ]);
  addSheet(xlsx, workbook, 'Projects', buildProjectRows(args.projects, args.filters), [
    14, 48, 14, 22, 14, 36, 28, 14, 14, 80, 18, 20, 26, 20, 14, 22, 22, 16,
  ]);
  addSheet(xlsx, workbook, 'Countries', buildCountryRows(args), [
    24, 14, 10, 20, 24, 16, 12, 12, 18, 14, 22, 10, 10, 10, 12, 12, 12, 12, 14, 14, 16, 20,
  ]);

  return { workbook, xlsx };
};

export const downloadMoonshotResultsWorkbook = async (args: ExportWorkbookArgs) => {
  const { workbook, xlsx } = await buildMoonshotResultsWorkbook(args);
  xlsx.writeFile(
    workbook,
    buildFilteredWorkbookFilename(args),
    { compression: true },
  );
};
