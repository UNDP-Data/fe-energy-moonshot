import {
  CountryMetadataRow,
  DashboardFilters,
  ProjectLevelDataType,
  ProjectSynopsisContext,
  SummaryMetrics,
} from '../Types';
import {
  getProjectBudget,
  getProjectDirectBeneficiariesForFilters,
  outputMatchesFilters,
  rankProjects,
} from './dashboardFilters';

const sumOutputValues = (
  project: ProjectLevelDataType,
  predicate: (_output: any) => boolean,
) => (project.outputs || []).reduce((sum, output) => (
  predicate(output) ? sum + Number(output.directBeneficiaries || 0) : sum
), 0);

export const formatSummaryNumber = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2).replace(/\.00$/, '')} billion`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2).replace(/\.00$/, '')} million`;
  if (value >= 1e3) return `${Math.round(value).toLocaleString()}`;
  return `${Math.round(value)}`;
};

export const buildSummaryMetrics = (
  filteredProjects: ProjectLevelDataType[],
  filters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
): SummaryMetrics => {
  const uniqueCountries = new Set<string>();
  const beneficiaryCategories = new Map<string, number>();
  const metrics: SummaryMetrics = {
    projectCount: 0,
    countryCount: 0,
    totalBudget: 0,
    directBeneficiaries: 0,
    vfBeneficiaries: 0,
    nonVfBeneficiaries: 0,
    cleanElectricityBeneficiaries: 0,
    cleanCookingBeneficiaries: 0,
    productiveUseBeneficiaries: 0,
    policyProjectCount: 0,
    topBeneficiaryCategories: [],
  };

  filteredProjects.forEach((project) => {
    if (countryMetadataByCode[project.countryCode]) {
      uniqueCountries.add(project.countryCode);
    } else if (project.countryCode) {
      uniqueCountries.add(project.countryCode);
    }

    const directBeneficiaries = getProjectDirectBeneficiariesForFilters(project, filters);
    const budget = getProjectBudget(project);

    metrics.projectCount += 1;
    metrics.totalBudget += budget;
    metrics.directBeneficiaries += directBeneficiaries;

    if (project.verticalFunded) {
      metrics.vfBeneficiaries += directBeneficiaries;
    } else {
      metrics.nonVfBeneficiaries += directBeneficiaries;
    }

    metrics.cleanElectricityBeneficiaries += sumOutputValues(
      project,
      (output) => outputMatchesFilters(output, filters)
        && output.outputCategory === 'Energy Access'
        && output.beneficiaryCategory === 'Clean Electricity',
    );
    metrics.cleanCookingBeneficiaries += sumOutputValues(
      project,
      (output) => outputMatchesFilters(output, filters)
        && output.outputCategory === 'Energy Access'
        && output.beneficiaryCategory === 'Clean Cooking',
    );
    metrics.productiveUseBeneficiaries += sumOutputValues(
      project,
      (output) => outputMatchesFilters(output, filters)
        && output.outputCategory === 'Energy Access'
        && !['Clean Electricity', 'Clean Cooking'].includes(output.beneficiaryCategory),
    );

    if ((project.outputs || []).some((output) => output.outputCategory === 'Policy')) {
      metrics.policyProjectCount += 1;
    }

    (project.outputs || []).forEach((output) => {
      if (!outputMatchesFilters(output, filters)) return;

      const category = output.beneficiaryCategory;
      if (
        !category
        || ['Other', 'Clean Electricity', 'Clean Cooking'].includes(category)
      ) {
        return;
      }

      beneficiaryCategories.set(
        category,
        (beneficiaryCategories.get(category) || 0) + Number(output.directBeneficiaries || 0),
      );
    });
  });

  metrics.countryCount = uniqueCountries.size;
  metrics.topBeneficiaryCategories = Array.from(beneficiaryCategories.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category, value]) => ({ category, value }));

  return metrics;
};

const describeScope = (filters: DashboardFilters, metadataByCode: Record<string, CountryMetadataRow>) => {
  if (filters.countryCode !== 'all') {
    return `in ${metadataByCode[filters.countryCode]?.['Country Name'] || filters.countryCode}`;
  }
  if (filters.bureau !== 'all') return `in ${filters.bureau}`;
  if (filters.specialGrouping !== 'all') {
    if (filters.specialGrouping === 'Other') return 'in countries outside SIDS, LDC, and LLDC groupings';
    return `in ${filters.specialGrouping === 'LDC' || filters.specialGrouping === 'LLDC' ? `${filters.specialGrouping}s` : filters.specialGrouping}`;
  }
  if (filters.continentRegion !== 'all') return `in ${filters.continentRegion}`;
  if (filters.subRegion !== 'all') return `in ${filters.subRegion}`;
  if (filters.sahel !== 'all') return 'in the Sahel';
  if (filters.crisis !== 'all') return 'in crisis-affected countries';
  if (filters.economy !== 'all') return `in ${filters.economy.toLowerCase()} countries`;
  if (filters.hdiTier !== 'all') return `in ${filters.hdiTier.toLowerCase()} HDI countries`;
  return 'globally';
};

export const generateDeterministicSummary = (
  metrics: SummaryMetrics,
  activeFilters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
) => {
  const scopeText = describeScope(activeFilters, countryMetadataByCode);

  if (metrics.projectCount === 0) {
    return `No active energy-related projects match the current filters ${scopeText === 'globally' ? 'globally' : scopeText}.`;
  }

  const topCategoriesText = metrics.topBeneficiaryCategories.length
    ? metrics.topBeneficiaryCategories
      .map((category) => `${formatSummaryNumber(category.value)} in ${category.category}`)
      .join(', ')
    : '0 in additional beneficiary categories';

  return [
    `The UNDP portfolio ${scopeText} during the 2022 to 2025 Strategic Plan includes ${formatSummaryNumber(metrics.projectCount)} active energy-related projects across ${formatSummaryNumber(metrics.countryCount)} countries.`,
    `The total budget for these projects is ${formatSummaryNumber(metrics.totalBudget)} USD, targeting ${formatSummaryNumber(metrics.directBeneficiaries)} direct beneficiaries. This includes ${formatSummaryNumber(metrics.vfBeneficiaries)} from VF projects and ${formatSummaryNumber(metrics.nonVfBeneficiaries)} from non-VF projects.`,
    `Of those directly benefiting, ${formatSummaryNumber(metrics.cleanElectricityBeneficiaries)} are gaining access to clean electricity and ${formatSummaryNumber(metrics.cleanCookingBeneficiaries)} are gaining access to clean cooking.`,
    `Additionally, ${formatSummaryNumber(metrics.productiveUseBeneficiaries)} people benefit from productive uses of energy, including ${topCategoriesText}.`,
    `${formatSummaryNumber(metrics.policyProjectCount)} projects also include outputs related to supporting policy or regulatory frameworks, capacity building, or other system benefits that provide indirect benefits.`,
  ].join(' ');
};

export const buildProjectSynopsisContext = (
  filteredProjects: ProjectLevelDataType[],
  filters: DashboardFilters,
): ProjectSynopsisContext => {
  const rankedProjects = rankProjects(filteredProjects, filters);

  return {
    totalProjects: filteredProjects.length,
    topProjects: rankedProjects.slice(0, 10),
  };
};
