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

export type SummaryTranslator = (
  _key: string,
  _options?: Record<string, any>,
) => string;

const interpolateFallback = (
  template: string,
  options: Record<string, any> = {},
) => template.replace(/\{\{(\w+)\}\}/g, (_match, key) => `${options[key] ?? ''}`);

const translate = (
  t: SummaryTranslator | undefined,
  key: string,
  fallback: string,
  options: Record<string, any> = {},
) => {
  if (!t) return interpolateFallback(fallback, options);
  const translated = t(key, { ...options, defaultValue: fallback });
  return translated === key ? interpolateFallback(fallback, options) : translated;
};

const sumOutputValues = (
  project: ProjectLevelDataType,
  predicate: (_output: any) => boolean,
) => (project.outputs || []).reduce((sum, output) => (
  predicate(output) ? sum + Number(output.directBeneficiaries || 0) : sum
), 0);

export const formatSummaryNumber = (value: number, t?: SummaryTranslator) => {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2).replace(/\.00$/, '')} ${translate(t, 'summary-unit-billion', 'billion')}`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2).replace(/\.00$/, '')} ${translate(t, 'summary-unit-million', 'million')}`;
  }
  if (value >= 1e3) return `${Math.round(value).toLocaleString()}`;
  return `${Math.round(value)}`;
};

const pluralize = (value: number, singular: string, plural = `${singular}s`) => (
  Math.round(value) === 1 ? singular : plural
);

const formatCountWithNoun = (
  value: number,
  singularKey: string,
  pluralKey: string,
  fallbackSingular: string,
  fallbackPlural: string,
  t?: SummaryTranslator,
) => (
  `${formatSummaryNumber(value, t)} ${translate(
    t,
    Math.round(value) === 1 ? singularKey : pluralKey,
    pluralize(value, fallbackSingular, fallbackPlural),
  )}`
);

const joinClauses = (clauses: string[], t?: SummaryTranslator) => {
  if (clauses.length <= 1) return clauses.join('');
  const andWord = translate(t, 'summary-and', 'and');
  if (clauses.length === 2) return `${clauses[0]} ${andWord} ${clauses[1]}`;
  return `${clauses.slice(0, -1).join(', ')}, ${andWord} ${clauses[clauses.length - 1]}`;
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

const getCountryName = (
  countryCode: string,
  metadataByCode: Record<string, CountryMetadataRow>,
) => metadataByCode[countryCode]?.['Country Name'] || countryCode;

const getFundingScopeClause = (funding: string, t?: SummaryTranslator) => {
  if (funding === 'vf') {
    return translate(t, 'summary-filter-funding-vf', 'that are VF');
  }
  if (funding === 'non-vf') {
    return translate(t, 'summary-filter-funding-non-vf', 'that are non-VF');
  }
  return '';
};

const getGenderScopeClause = (genderMarker: string, t?: SummaryTranslator) => {
  if (genderMarker === 'no-marker') {
    return translate(t, 'summary-filter-gender-none', 'that do not have a Gender Marker');
  }
  if (genderMarker !== 'all') {
    return translate(t, 'summary-filter-gender', 'that have {{genderMarker}} Gender Markers', {
      genderMarker,
    });
  }
  return '';
};

const getThemeScopeClause = (filters: DashboardFilters, t?: SummaryTranslator) => {
  if (filters.subCategory !== 'all') {
    return translate(t, 'summary-filter-subcategory', 'focused on {{subCategory}}', {
      subCategory: filters.subCategory,
    });
  }
  if (filters.category !== 'all') {
    return translate(t, 'summary-filter-category', 'focused on {{category}}', {
      category: filters.category,
    });
  }
  return '';
};

const getDeterministicScopeClauses = (
  filters: DashboardFilters,
  metadataByCode: Record<string, CountryMetadataRow>,
  t?: SummaryTranslator,
) => {
  const clauses: string[] = [];

  if (filters.countryCode !== 'all') {
    clauses.push(translate(t, 'summary-filter-country', 'in {{country}}', {
      country: getCountryName(filters.countryCode, metadataByCode),
    }));
  }
  if (filters.bureau !== 'all') {
    clauses.push(translate(t, 'summary-filter-bureau', 'in the {{bureau}} region', {
      bureau: filters.bureau,
    }));
  }
  if (filters.continentRegion !== 'all') {
    clauses.push(translate(t, 'summary-filter-continent', 'in {{region}}', {
      region: filters.continentRegion,
    }));
  }
  if (filters.subRegion !== 'all') {
    clauses.push(translate(t, 'summary-filter-subregion', 'in {{region}}', {
      region: filters.subRegion,
    }));
  }
  if (filters.specialGrouping !== 'all') {
    clauses.push(filters.specialGrouping === 'Other'
      ? translate(t, 'summary-filter-special-other', 'in countries outside SIDS, LDC, and LLDC groupings')
      : translate(t, 'summary-filter-special-grouping', 'in {{grouping}}', {
        grouping: filters.specialGrouping === 'LDC' || filters.specialGrouping === 'LLDC'
          ? `${filters.specialGrouping}s`
          : filters.specialGrouping,
      }));
  }
  if (filters.sahel !== 'all') {
    clauses.push(translate(t, 'summary-filter-sahel', 'in the Sahel'));
  }
  if (filters.crisis !== 'all') {
    clauses.push(translate(t, 'summary-filter-crisis', 'in crisis-affected countries'));
  }
  if (filters.economy !== 'all') {
    clauses.push(translate(t, 'summary-filter-economy', 'in {{economy}} economies', {
      economy: filters.economy,
    }));
  }
  if (filters.hdiTier !== 'all') {
    clauses.push(translate(t, 'summary-filter-hdi', 'that are classified as {{hdiTier}} HDI', {
      hdiTier: filters.hdiTier,
    }));
  }

  const fundingClause = getFundingScopeClause(filters.funding, t);
  if (fundingClause) clauses.push(fundingClause);

  const genderClause = getGenderScopeClause(filters.genderMarker, t);
  if (genderClause) clauses.push(genderClause);

  const themeClause = getThemeScopeClause(filters, t);
  if (themeClause) clauses.push(themeClause);

  return clauses;
};

const describeScope = (
  filters: DashboardFilters,
  metadataByCode: Record<string, CountryMetadataRow>,
  t?: SummaryTranslator,
) => {
  const clauses = getDeterministicScopeClauses(filters, metadataByCode, t);
  if (!clauses.length) return translate(t, 'summary-scope-global', 'globally');
  return joinClauses(clauses, t);
};

export const generateDeterministicSummary = (
  metrics: SummaryMetrics,
  activeFilters: DashboardFilters,
  countryMetadataByCode: Record<string, CountryMetadataRow>,
  t?: SummaryTranslator,
) => {
  const scopeText = describeScope(activeFilters, countryMetadataByCode, t);
  const globalScope = translate(t, 'summary-scope-global', 'globally');

  if (metrics.projectCount === 0) {
    return translate(
      t,
      'summary-no-results',
      'No active energy-related projects match the current filters {{scope}}.',
      { scope: scopeText === globalScope ? globalScope : scopeText },
    );
  }

  const sentences = [
    translate(
      t,
      'summary-intro',
      'The UNDP portfolio {{scope}} during the 2022 to 2025 Strategic Plan includes {{projectCount}} across {{countryCount}}.',
      {
        scope: scopeText,
        projectCount: formatCountWithNoun(
          metrics.projectCount,
          'summary-project-singular',
          'summary-project-plural',
          'active energy-related project',
          'active energy-related projects',
          t,
        ),
        countryCount: formatCountWithNoun(
          metrics.countryCount,
          'summary-country-singular',
          'summary-country-plural',
          'country',
          'countries',
          t,
        ),
      },
    ),
  ];

  const budgetAndBeneficiaryClauses = [];
  if (metrics.totalBudget > 0) {
    budgetAndBeneficiaryClauses.push(translate(
      t,
      'summary-budget-clause',
      'a total budget of {{budget}} USD',
      { budget: formatSummaryNumber(metrics.totalBudget, t) },
    ));
  }
  if (metrics.directBeneficiaries > 0) {
    budgetAndBeneficiaryClauses.push(translate(
      t,
      'summary-direct-beneficiaries-clause',
      '{{beneficiaries}} targeted',
      {
        beneficiaries: formatCountWithNoun(
          metrics.directBeneficiaries,
          'summary-direct-beneficiary-singular',
          'summary-direct-beneficiary-plural',
          'direct beneficiary',
          'direct beneficiaries',
          t,
        ),
      },
    ));
  }
  if (budgetAndBeneficiaryClauses.length) {
    sentences.push(translate(t, 'summary-together', 'Together, these projects have {{clauses}}.', {
      clauses: joinClauses(budgetAndBeneficiaryClauses, t),
    }));
  }

  const fundingClauses = [];
  if (metrics.vfBeneficiaries > 0) {
    fundingClauses.push(translate(t, 'summary-vf-clause', '{{beneficiaries}} from VF projects', {
      beneficiaries: formatSummaryNumber(metrics.vfBeneficiaries, t),
    }));
  }
  if (metrics.nonVfBeneficiaries > 0) {
    fundingClauses.push(translate(t, 'summary-non-vf-clause', '{{beneficiaries}} from non-VF projects', {
      beneficiaries: formatSummaryNumber(metrics.nonVfBeneficiaries, t),
    }));
  }
  if (fundingClauses.length > 1) {
    sentences.push(translate(t, 'summary-funding-split', 'Direct beneficiaries include {{clauses}}.', {
      clauses: joinClauses(fundingClauses, t),
    }));
  }

  const accessClauses = [];
  if (metrics.cleanElectricityBeneficiaries > 0) {
    accessClauses.push(translate(t, 'summary-clean-electricity-clause', '{{beneficiaries}} gaining access to clean electricity', {
      beneficiaries: formatSummaryNumber(metrics.cleanElectricityBeneficiaries, t),
    }));
  }
  if (metrics.cleanCookingBeneficiaries > 0) {
    accessClauses.push(translate(t, 'summary-clean-cooking-clause', '{{beneficiaries}} gaining access to clean cooking', {
      beneficiaries: formatSummaryNumber(metrics.cleanCookingBeneficiaries, t),
    }));
  }
  if (accessClauses.length) {
    sentences.push(translate(t, 'summary-access', 'Of those directly benefiting, {{clauses}}.', {
      clauses: joinClauses(accessClauses, t),
    }));
  }

  if (metrics.productiveUseBeneficiaries > 0) {
    const topCategories = metrics.topBeneficiaryCategories
      .filter((category) => category.value > 0)
      .map((category) => translate(t, 'summary-category-clause', '{{beneficiaries}} in {{category}}', {
        beneficiaries: formatSummaryNumber(category.value, t),
        category: category.category,
      }));
    const categoryClause = topCategories.length
      ? translate(t, 'summary-including-categories', ', including {{categories}}', {
        categories: joinClauses(topCategories, t),
      })
      : '';
    sentences.push(translate(t, 'summary-productive-use', '{{beneficiaries}} from productive uses of energy{{categoryClause}}.', {
      beneficiaries: formatCountWithNoun(
        metrics.productiveUseBeneficiaries,
        'summary-person-benefits-singular',
        'summary-person-benefits-plural',
        'person benefits',
        'people benefit',
        t,
      ),
      categoryClause,
    }));
  }

  if (metrics.policyProjectCount > 0) {
    sentences.push(translate(t, 'summary-policy', '{{projectCount}} also {{verb}} outputs related to supporting policy or regulatory frameworks, capacity building, or other system benefits that provide indirect benefits.', {
      projectCount: formatCountWithNoun(
        metrics.policyProjectCount,
        'summary-policy-project-singular',
        'summary-policy-project-plural',
        'project',
        'projects',
        t,
      ),
      verb: translate(
        t,
        metrics.policyProjectCount === 1 ? 'summary-includes-singular' : 'summary-includes-plural',
        metrics.policyProjectCount === 1 ? 'includes' : 'include',
      ),
    }));
  }

  return sentences.join(' ');
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
