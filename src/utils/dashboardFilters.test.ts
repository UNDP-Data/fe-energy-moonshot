import { vi } from 'vitest';
import {
  CountryMetadataRow,
  DashboardFilters,
  ProjectLevelDataType,
} from '../Types';
import {
  buildCountryMetadataMap,
  buildFilterCatalog,
  DEFAULT_DASHBOARD_FILTERS,
  filterProjects,
  getMoonshotProxyBaseUrl,
  normalizeProjectLevelData,
  parseQueryLocally,
  rankProjects,
} from './dashboardFilters';
import {
  buildSummaryMetrics,
  generateDeterministicSummary,
} from './summary';
import {
  buildFilteredWorkbookFilename,
  buildCountryRows,
  buildOutputRows,
  buildProjectRows,
  buildSummaryRows,
} from './exportWorkbook';

const countryMetadata: CountryMetadataRow[] = [
  {
    'Country Name': 'Kenya',
    'Country Code': 'KEN',
    Region: 'RBA',
    Economy: 'Lower middle income',
    HDI: 'Medium',
    LDC: '',
    SIDS: '',
    LLDC: '',
    Sahel: '',
    Crisis: '',
    'continent-region': 'Africa',
    'sub-region': 'Sub-Saharan Africa',
  },
  {
    'Country Name': 'Niger',
    'Country Code': 'NER',
    Region: 'RBA',
    Economy: 'Low income',
    HDI: 'Low',
    LDC: 'LDC',
    SIDS: '',
    LLDC: 'LLDC',
    Sahel: 'Sahel',
    Crisis: 'Crisis',
    'continent-region': 'Africa',
    'sub-region': 'Sub-Saharan Africa',
  },
  {
    'Country Name': 'Thailand',
    'Country Code': 'THA',
    Region: 'RBAP',
    Economy: 'Upper middle income',
    HDI: 'High',
    LDC: '',
    SIDS: '',
    LLDC: '',
    Sahel: '',
    Crisis: '',
    'continent-region': 'Asia',
    'sub-region': 'South-eastern Asia',
  },
  {
    'Country Name': 'Colombia',
    'Country Code': 'COL',
    Region: 'RBLAC',
    Economy: 'Upper middle income',
    HDI: 'High',
    LDC: '',
    SIDS: '',
    LLDC: '',
    Sahel: '',
    Crisis: '',
    'continent-region': 'Americas',
    'sub-region': 'Latin America and the Caribbean',
  },
  {
    'Country Name': 'Egypt',
    'Country Code': 'EGY',
    Region: 'RBAS',
    Economy: 'Lower middle income',
    HDI: 'High',
    LDC: '',
    SIDS: '',
    LLDC: '',
    Sahel: '',
    Crisis: '',
    'continent-region': 'Africa',
    'sub-region': 'Northern Africa',
  },
  {
    'Country Name': 'Albania',
    'Country Code': 'ALB',
    Region: 'RBEC',
    Economy: 'Upper middle income',
    HDI: 'High',
    LDC: '',
    SIDS: '',
    LLDC: '',
    Sahel: '',
    Crisis: '',
    'continent-region': 'Europe',
    'sub-region': 'Southern Europe',
  },
];

const makeProject = (overrides: Partial<ProjectLevelDataType>): ProjectLevelDataType => ({
  id: overrides.id || 'project-1',
  title: overrides.title || 'Project title',
  description: overrides.description || 'Project description',
  countryName: overrides.countryName || 'Niger',
  countryCode: overrides.countryCode || 'NER',
  projectTitle: overrides.projectTitle || 'Project title',
  country: overrides.country || 'Niger',
  link: overrides.link || '',
  donors: overrides.donors || null,
  region: overrides.region || 'RBA',
  verticalFunded: overrides.verticalFunded || false,
  flagship: overrides.flagship || '',
  budget: overrides.budget || 100,
  outputCount: overrides.outputCount || 2,
  genderMarker: overrides.genderMarker || '',
  dirBeneficiaries: overrides.dirBeneficiaries || 0,
  indirBeneficiaries: overrides.indirBeneficiaries || 0,
  fundingSources: overrides.fundingSources || '',
  hdiTier: overrides.hdiTier || 'Low',
  projectDescription: overrides.projectDescription || '',
  outputs: overrides.outputs || [],
  thematics: overrides.thematics || [],
  incomeGroup: overrides.incomeGroup || 'Low income',
  specialGroupings: overrides.specialGroupings || ['LDC', 'LLDC'],
  regionBureau: overrides.regionBureau || 'RBA',
  'projectID_PIMS+': overrides['projectID_PIMS+'] || 1,
  'projectID_Atlas': overrides['projectID_Atlas'] || 1,
  'Short Title': overrides['Short Title'] || 'Short title',
  'Lead Country': overrides['Lead Country'] || 'Niger',
  'Regional Bureau': overrides['Regional Bureau'] || 'RBA',
  'Source of Funds': overrides['Source of Funds'] || '',
  'Grant amount': overrides['Grant amount'] || 100,
  Partners: overrides.Partners || '',
  Source_documentation: overrides.Source_documentation || '',
});

describe('dashboard assistant utilities', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the assistant proxy base URL from Vite env variables', () => {
    vi.stubEnv('VITE_MOONSHOT_PROXY_BASE_URL', 'https://moonshot.example');
    expect(getMoonshotProxyBaseUrl()).toBe('https://moonshot.example');

    vi.stubEnv('VITE_MOONSHOT_PROXY_BASE_URL', '');
    vi.stubEnv('VITE_ASSISTANT_PROXY_BASE_URL', 'https://assistant.example');
    expect(getMoonshotProxyBaseUrl()).toBe('https://assistant.example');
  });

  it('parses structured filters from a clean cooking LDC query', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);
    const parsed = parseQueryLocally('Show non-VF clean cooking work in LDCs', filterCatalog);

    expect(parsed.filters.funding).toBe('non-vf');
    expect(parsed.filters.category).toBe('Energy Access');
    expect(parsed.filters.subCategory).toBe('Clean Cooking');
    expect(parsed.filters.specialGrouping).toBe('LDC');
  });

  it('matches beneficiary subcategory aliases directly', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);

    expect(parseQueryLocally('Show clean cooking projects', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Clean Cooking',
    });
    expect(parseQueryLocally('Show cookstove projects', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Clean Cooking',
    });
    expect(parseQueryLocally('Show electricity access projects', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Clean Electricity',
    });
    expect(parseQueryLocally('Show productive use of energy projects', filterCatalog).filters).toMatchObject({
      subCategory: 'Productive Use',
    });
  });

  it('uses the manual semantic alias control file for topic-to-filter matching', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);

    expect(parseQueryLocally('show projects on e-mobility', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Transport',
    });
    expect(parseQueryLocally('electric vehicle charging infrastructure', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Transport',
    });
    expect(parseQueryLocally('mini-grid electricity access projects', filterCatalog).filters).toMatchObject({
      category: 'Energy Access',
      subCategory: 'Clean Electricity',
    });
  });

  it('resolves geography metadata such as Sahel and country names', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);

    expect(parseQueryLocally('What is happening in the Sahel?', filterCatalog).filters.sahel).toBe('yes');
    expect(parseQueryLocally('Projects in Kenya', filterCatalog).filters.countryCode).toBe('KEN');
  });

  it('prefers UNDP regional bureau aliases for regional queries', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);

    expect(parseQueryLocally('Clean cooking in RBAP', filterCatalog).filters).toMatchObject({ bureau: 'RBAP' });
    expect(parseQueryLocally('Clean cooking in Asia-Pacific', filterCatalog).filters).toMatchObject({ bureau: 'RBAP' });
    expect(parseQueryLocally('Projects in Asia', filterCatalog).filters).toMatchObject({ bureau: 'RBAP' });
    expect(parseQueryLocally('Projects in Latin America and the Caribbean', filterCatalog).filters).toMatchObject({ bureau: 'RBLAC' });
    expect(parseQueryLocally('Work in Arab States', filterCatalog).filters).toMatchObject({ bureau: 'RBAS' });
    expect(parseQueryLocally('Energy work in Eastern Europe and CIS', filterCatalog).filters).toMatchObject({ bureau: 'RBEC' });
    expect(parseQueryLocally('Projects in Africa', filterCatalog).filters).toMatchObject({ bureau: 'RBA' });
  });

  it('does not keep accidental country matches when a bureau is explicit', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);
    const parsed = parseQueryLocally('Clean cooking in Asia', filterCatalog);

    expect(parsed.filters.bureau).toBe('RBAP');
    expect(parsed.filters.countryCode).toBeUndefined();
  });

  it('keeps project links in deterministic top-project ranking', () => {
    const ranked = rankProjects([
      makeProject({
        id: 'linked-project',
        title: 'Linked project',
        link: 'https://example.com/project',
        budget: 200,
      }),
    ]);

    expect(ranked[0].link).toBe('https://example.com/project');
  });

  it('ranks top projects by direct beneficiaries before budget', () => {
    const ranked = rankProjects([
      makeProject({
        id: 'largest-budget',
        title: 'Largest budget',
        budget: 5000,
        outputs: [
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 50,
          },
        ],
      }),
      makeProject({
        id: 'largest-beneficiaries',
        title: 'Largest beneficiaries',
        budget: 100,
        outputs: [
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 500,
          },
        ],
      }),
      makeProject({
        id: 'tie-break-budget',
        title: 'Tie break budget',
        budget: 300,
        outputs: [
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 50,
          },
        ],
      }),
    ]);

    expect(ranked.map((project) => project.id)).toEqual([
      'largest-beneficiaries',
      'largest-budget',
      'tie-break-budget',
    ]);
  });

  it('builds deterministic summary metrics from the filtered output slice', () => {
    const filters: DashboardFilters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      category: 'Energy Access',
      subCategory: 'Clean Cooking',
    };
    const countryMetadataByCode = buildCountryMetadataMap(countryMetadata);
    const projects = filterProjects([
      makeProject({
        id: 'niger-clean-cooking',
        countryCode: 'NER',
        countryName: 'Niger',
        outputs: [
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Cooking',
            directBeneficiaries: 20,
          },
          {
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Solar',
            directBeneficiaries: 200,
          },
          {
            outputCategory: 'Policy',
            beneficiaryCategory: 'Policy - Overall',
            directBeneficiaries: 0,
          },
        ],
      }),
    ], filters, countryMetadataByCode);

    const metrics = buildSummaryMetrics(projects, filters, countryMetadataByCode);
    const summary = generateDeterministicSummary(metrics, filters, countryMetadataByCode);

    expect(metrics.projectCount).toBe(1);
    expect(metrics.countryCount).toBe(1);
    expect(metrics.directBeneficiaries).toBe(20);
    expect(metrics.cleanCookingBeneficiaries).toBe(20);
    expect(metrics.cleanElectricityBeneficiaries).toBe(0);
    expect(summary).toContain('1 active energy-related project');
    expect(summary).toContain('Together, these projects have a total budget of 100 USD and target 20 direct beneficiaries.');
    expect(summary).toContain('Of those directly benefiting, 20 are gaining access to clean cooking.');
  });

  it('keeps productive-use top categories aligned to energy access categories', () => {
    const filters: DashboardFilters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      bureau: 'RBAP',
    };
    const countryMetadataByCode = buildCountryMetadataMap(countryMetadata);
    const projects = filterProjects([
      makeProject({
        id: 'rbap-project',
        countryCode: 'THA',
        countryName: 'Thailand',
        region: 'RBAP',
        outputs: [
          {
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Some Sources',
            directBeneficiaries: 2000000,
          },
          {
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Solar',
            directBeneficiaries: 1000000,
          },
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Transport',
            directBeneficiaries: 4000,
          },
          {
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 500,
          },
        ],
      }),
    ], filters, countryMetadataByCode);

    const metrics = buildSummaryMetrics(projects, filters, countryMetadataByCode);
    const summary = generateDeterministicSummary(metrics, filters, countryMetadataByCode);

    expect(metrics.productiveUseBeneficiaries).toBe(4000);
    expect(metrics.topBeneficiaryCategories).toEqual([{ category: 'Transport', value: 4000 }]);
    expect(summary).toContain('Of those directly benefiting, 500 are gaining access to clean electricity and 4,000 are benefiting from productive uses of energy, including 4,000 in Transport.');
    expect(summary).not.toContain('Some Sources');
    expect(summary).not.toContain('Solar');
  });

  it('omits zero-value deterministic summary clauses and pluralizes correctly', () => {
    const filters: DashboardFilters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      bureau: 'RBAP',
      category: 'Energy Access',
      subCategory: 'Transport',
    };
    const metadataByCode = buildCountryMetadataMap(countryMetadata);
    const summary = generateDeterministicSummary({
      projectCount: 2,
      countryCount: 2,
      totalBudget: 16280000,
      directBeneficiaries: 4076,
      vfBeneficiaries: 0,
      nonVfBeneficiaries: 4076,
      cleanElectricityBeneficiaries: 0,
      cleanCookingBeneficiaries: 0,
      productiveUseBeneficiaries: 4076,
      policyProjectCount: 1,
      topBeneficiaryCategories: [{ category: 'Transport', value: 4076 }],
    }, filters, metadataByCode);

    expect(summary).toContain('in the RBAP region and focused on Transport');
    expect(summary).toContain('2 active energy-related projects across 2 countries');
    expect(summary).not.toContain('Strategic Plan');
    expect(summary).toContain('16.28 million USD');
    expect(summary).toContain('4,076 direct beneficiaries');
    expect(summary).toContain('Together, these projects have a total budget of 16.28 million USD and target 4,076 direct beneficiaries.');
    expect(summary).toContain('Of those directly benefiting, 4,076 are benefiting from productive uses of energy, including 4,076 in Transport.');
    expect(summary).toContain('1 project also includes');
    expect(summary).not.toContain('includes 0');
    expect(summary).not.toContain('targeting 0');
    expect(summary).not.toContain(' 0 from');
    expect(summary).not.toContain('VF projects');
    expect(summary).not.toContain('clean electricity');
    expect(summary).not.toContain('clean cooking');
    expect(summary).not.toContain('1 projects');
  });

  it('includes all active deterministic filter clauses in the summary scope', () => {
    const filters: DashboardFilters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      funding: 'non-vf',
      genderMarker: 'GEN2',
      category: 'Energy Access',
      subCategory: 'Clean Cooking',
      bureau: 'RBA',
      economy: 'High income',
      hdiTier: 'Low',
      specialGrouping: 'LDC',
      sahel: 'yes',
      crisis: 'yes',
    };
    const metadataByCode = buildCountryMetadataMap(countryMetadata);
    const summary = generateDeterministicSummary({
      projectCount: 1,
      countryCount: 1,
      totalBudget: 100,
      directBeneficiaries: 10,
      vfBeneficiaries: 0,
      nonVfBeneficiaries: 10,
      cleanElectricityBeneficiaries: 0,
      cleanCookingBeneficiaries: 10,
      productiveUseBeneficiaries: 0,
      policyProjectCount: 0,
      topBeneficiaryCategories: [],
    }, filters, metadataByCode);

    expect(summary).toContain('The UNDP portfolio in the RBA region');
    expect(summary).toContain('in LDCs');
    expect(summary).toContain('in the Sahel');
    expect(summary).toContain('in crisis-affected countries');
    expect(summary).toContain('in High income economies');
    expect(summary).toContain('that are classified as Low HDI');
    expect(summary).toContain('that are non-VF');
    expect(summary).toContain('that have GEN2 Gender Markers');
    expect(summary).toContain('focused on Clean Cooking');
  });

  it('normalizes the corrupted Algeria waste beneficiary outlier at load time', () => {
    const normalized = normalizeProjectLevelData([
      makeProject({
        id: '6163',
        countryCode: 'DZA',
        countryName: 'Algeria',
        outputs: [
          {
            id: 'DZA-6163-Waste-0',
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Waste',
            directBeneficiaries: 32819587500,
          },
        ],
      }),
    ]);

    expect(normalized[0].outputs[0].directBeneficiaries).toBe(35000);
  });

  it('restores Egypt solar projects to the archived category and beneficiary values', () => {
    const normalized = normalizeProjectLevelData([
      makeProject({
        id: '4998',
        countryCode: 'EGY',
        countryName: 'Egypt',
        outputs: [
          {
            id: 'EGY-4998-CleanElectricity-0',
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 4130,
          },
        ],
      }),
      makeProject({
        id: '4998',
        countryCode: 'EGY',
        countryName: 'Egypt',
        outputs: [
          {
            id: 'EGY-4998-Solar-0',
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Solar',
            mwAdded: 4130,
            directBeneficiaries: 72275000,
          },
        ],
      }),
      makeProject({
        id: '6249',
        countryCode: 'EGY',
        countryName: 'Egypt',
        outputs: [
          {
            id: 'EGY-6249-CleanElectricity-0',
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 7500,
          },
        ],
      }),
      makeProject({
        id: '6249',
        countryCode: 'EGY',
        countryName: 'Egypt',
        outputs: [
          {
            id: 'EGY-6249-Solar-0',
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Solar',
            mwAdded: 0,
            directBeneficiaries: 7500,
          },
        ],
      }),
    ]);

    expect(normalized[0].outputs[0].outputCategory).toBe('Energy Transition');
    expect(normalized[0].outputs[0].beneficiaryCategory).toBe('Solar');
    expect(normalized[0].outputs[0].mwAdded).toBe(18);
    expect(normalized[0].outputs[0].directBeneficiaries).toBe(315000);

    expect(normalized[1].outputs[0].outputCategory).toBe('Energy Transition');
    expect(normalized[1].outputs[0].beneficiaryCategory).toBe('Solar');
    expect(normalized[1].outputs[0].mwAdded).toBe(18);
    expect(normalized[1].outputs[0].directBeneficiaries).toBe(315000);

    expect(normalized[2].outputs[0].outputCategory).toBe('Energy Transition');
    expect(normalized[2].outputs[0].beneficiaryCategory).toBe('Solar');
    expect(normalized[2].outputs[0].mwAdded).toBe(1);
    expect(normalized[2].outputs[0].directBeneficiaries).toBe(17500);

    expect(normalized[3].outputs[0].outputCategory).toBe('Energy Transition');
    expect(normalized[3].outputs[0].beneficiaryCategory).toBe('Solar');
    expect(normalized[3].outputs[0].mwAdded).toBe(1);
    expect(normalized[3].outputs[0].directBeneficiaries).toBe(17500);
  });

  it('builds filtered workbook rows for summary, outputs, projects, and countries', () => {
    const filters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      category: 'Energy Access',
      subCategory: 'Clean Cooking',
    };
    const filterCatalog = buildFilterCatalog(countryMetadata);
    const countryMetadataByCode = buildCountryMetadataMap(countryMetadata);
    const projects = [
      makeProject({
        id: 'cook-1',
        title: 'Cooking project',
        budget: 500,
        outputs: [
          {
            id: 'output-1',
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Cooking',
            directBeneficiaries: 100,
            mwAdded: 0,
            energySaved: 0,
            policies: 0,
            finance: 0,
            percentFemale: 50,
            description: 'Clean cooking output',
          },
          {
            id: 'output-2',
            outputCategory: 'Policy',
            beneficiaryCategory: 'Policy - Clean Cooking',
            directBeneficiaries: 0,
          },
        ],
      }),
    ];
    const metrics = buildSummaryMetrics(projects, filters, countryMetadataByCode);
    const summaryText = generateDeterministicSummary(metrics, filters, countryMetadataByCode);
    const args = {
      countryMetadataByCode,
      filterCatalog,
      filters,
      projects,
      summaryMetrics: metrics,
      summaryText,
    };

    const summaryRows = buildSummaryRows(args);
    expect(Object.keys(summaryRows[0])).toEqual([
      'Region',
      'Category',
      'Subcategory',
      'VF or Non-VF',
      'Direct Beneficiaries',
      'Energy Access',
      'Productive Use',
      'Budget Sum (M USD)',
      'Project Count',
      'Country Count',
    ]);
    expect(summaryRows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        Region: 'All',
        Category: 'All',
        Subcategory: 'All',
        'VF or Non-VF': 'Total',
        'Direct Beneficiaries': 100,
        'Energy Access': 100,
        'Productive Use': 0,
        'Budget Sum (M USD)': 500,
        'Project Count': 1,
        'Country Count': 1,
      }),
      expect.objectContaining({
        Region: 'All',
        Category: 'Beneficiary Category',
        Subcategory: 'Clean Cooking',
        'VF or Non-VF': 'Total',
        'Direct Beneficiaries': 100,
      }),
    ]));
    expect(buildOutputRows(projects, filters)).toEqual([
      expect.objectContaining({
        'Project ID': 'cook-1',
        'Output ID': 'output-1',
        'Beneficiary Category': 'Clean Cooking',
        'Direct Beneficiaries': 100,
      }),
    ]);
    expect(buildProjectRows(projects, filters)[0]).toEqual(expect.objectContaining({
      'Project ID': 'cook-1',
      'Output Count': 1,
      'Direct Beneficiaries': 100,
    }));
    expect(buildCountryRows(args)[0]).toEqual(expect.objectContaining({
      'Country Code': 'NER',
      'Project Count': 1,
      'Output Count': 1,
      'Budget Total': 500,
      'Direct Beneficiaries': 100,
    }));
    expect(buildFilteredWorkbookFilename(args)).toMatch(
      /^sustainable-energy-tracker-energy-access_clean-cooking-\d{4}-\d{2}-\d{2}\.xlsx$/,
    );
  });

  it('groups energy transition outputs into the Summary Energy Access column', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);
    const countryMetadataByCode = buildCountryMetadataMap(countryMetadata);
    const projects = [
      makeProject({
        id: 'electricity-1',
        budget: 100,
        outputs: [
          {
            id: 'output-1',
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Clean Electricity',
            directBeneficiaries: 10,
          },
        ],
      }),
      makeProject({
        id: 'solar-1',
        budget: 200,
        outputs: [
          {
            id: 'output-2',
            outputCategory: 'Energy Transition',
            beneficiaryCategory: 'Solar',
            directBeneficiaries: 25,
          },
        ],
      }),
      makeProject({
        id: 'transport-1',
        budget: 300,
        outputs: [
          {
            id: 'output-3',
            outputCategory: 'Energy Access',
            beneficiaryCategory: 'Transport',
            directBeneficiaries: 40,
          },
        ],
      }),
    ];
    const metrics = buildSummaryMetrics(projects, DEFAULT_DASHBOARD_FILTERS, countryMetadataByCode);
    const args = {
      countryMetadataByCode,
      filterCatalog,
      filters: DEFAULT_DASHBOARD_FILTERS,
      projects,
      summaryMetrics: metrics,
      summaryText: '',
    };

    expect(buildSummaryRows(args)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        Region: 'All',
        Category: 'All',
        Subcategory: 'All',
        'VF or Non-VF': 'Total',
        'Direct Beneficiaries': 75,
        'Energy Access': 35,
        'Productive Use': 40,
      }),
      expect.objectContaining({
        Region: 'All',
        Category: 'Beneficiary Tier',
        Subcategory: 'Access to Energy',
        'Direct Beneficiaries': 35,
        'Energy Access': 35,
      }),
    ]));
  });
});
