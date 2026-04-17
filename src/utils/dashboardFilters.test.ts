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
  normalizeProjectLevelData,
  parseQueryLocally,
} from './dashboardFilters';
import {
  buildSummaryMetrics,
  generateDeterministicSummary,
} from './summary';

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
  it('parses structured filters from a clean cooking LDC query', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);
    const parsed = parseQueryLocally('Show non-VF clean cooking work in LDCs', filterCatalog);

    expect(parsed.filters.funding).toBe('non-vf');
    expect(parsed.filters.category).toBe('Energy Access');
    expect(parsed.filters.subCategory).toBe('Clean Cooking');
    expect(parsed.filters.specialGrouping).toBe('LDC');
  });

  it('resolves geography metadata such as Sahel and country names', () => {
    const filterCatalog = buildFilterCatalog(countryMetadata);

    expect(parseQueryLocally('What is happening in the Sahel?', filterCatalog).filters.sahel).toBe('yes');
    expect(parseQueryLocally('Projects in Kenya', filterCatalog).filters.countryCode).toBe('KEN');
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
    expect(summary).toContain('1 active energy-related projects');
    expect(summary).toContain('20 direct beneficiaries');
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
});
