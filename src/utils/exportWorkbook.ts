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
import { formatSummaryNumber } from './summary';

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
  filterCatalog,
  filters,
  summaryMetrics,
  summaryText,
}: ExportWorkbookArgs): WorkbookRow[] => {
  const appliedFilters = getAppliedFilterEntries(filters, filterCatalog);
  const filterLabel = appliedFilters.length
    ? appliedFilters.map((filter) => filter.label).join(', ')
    : 'All projects';

  return [
    { Section: 'Overview', Metric: 'Filtered section', Value: filterLabel },
    { Section: 'Overview', Metric: 'Deterministic summary', Value: summaryText },
    { Section: 'Metrics', Metric: 'Project count', Value: summaryMetrics.projectCount },
    { Section: 'Metrics', Metric: 'Country count', Value: summaryMetrics.countryCount },
    { Section: 'Metrics', Metric: 'Total budget (USD)', Value: summaryMetrics.totalBudget },
    { Section: 'Metrics', Metric: 'Direct beneficiaries', Value: summaryMetrics.directBeneficiaries },
    { Section: 'Metrics', Metric: 'VF direct beneficiaries', Value: summaryMetrics.vfBeneficiaries },
    { Section: 'Metrics', Metric: 'Non-VF direct beneficiaries', Value: summaryMetrics.nonVfBeneficiaries },
    { Section: 'Metrics', Metric: 'Clean electricity beneficiaries', Value: summaryMetrics.cleanElectricityBeneficiaries },
    { Section: 'Metrics', Metric: 'Clean cooking beneficiaries', Value: summaryMetrics.cleanCookingBeneficiaries },
    { Section: 'Metrics', Metric: 'Productive-use beneficiaries', Value: summaryMetrics.productiveUseBeneficiaries },
    { Section: 'Metrics', Metric: 'Projects with policy/system-benefit outputs', Value: summaryMetrics.policyProjectCount },
    ...summaryMetrics.topBeneficiaryCategories.map((category, index) => ({
      Section: 'Top productive-use categories',
      Metric: `${index + 1}. ${category.category}`,
      Value: category.value,
    })),
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

  addSheet(xlsx, workbook, 'Summary', buildSummaryRows(args), [28, 42, 120]);
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
  const date = new Date().toISOString().slice(0, 10);
  const projectCount = args.summaryMetrics.projectCount;
  const beneficiaryLabel = formatSummaryNumber(args.summaryMetrics.directBeneficiaries)
    .replace(/\s+/g, '-')
    .replace(/,/g, '');
  const { workbook, xlsx } = await buildMoonshotResultsWorkbook(args);
  xlsx.writeFile(
    workbook,
    `sustainable-energy-tracker-results-${projectCount}-projects-${beneficiaryLabel}-beneficiaries-${date}.xlsx`,
    { compression: true },
  );
};
