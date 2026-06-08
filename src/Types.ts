/* eslint-disable camelcase */
export interface BboxCoords {
  lat: number;
  lon: number;
}

export interface BboxDataType {
  sw: BboxCoords;
  ne: BboxCoords;
}

export interface CountryGroupDataType {
  'Alpha-2 code': string;
  'Alpha-3 code': string;
  'Country or Area': string;
  'Development classification': string;
  'Group 1': string;
  'Group 2': string;
  'Group 3': string;
  'LDC': boolean;
  'LLDC': boolean;
  'Latitude (average)': number;
  'Longitude (average)': number;
  'Numeric code': number;
  'SIDS': boolean;
  'Income group': string;
  bbox: BboxDataType;
}

export interface RegionDataType {
  'value': string;
  'label': string;
}

export interface IndicatorDataType {
  indicator: string;
  value?: number;
}

export interface DataType extends CountryGroupDataType {
  indicators: IndicatorDataType[];
  indicatorsAvailable: string[];
  region: string;
  numberProjects: number;
}

export interface IndicatorMetaDataType {
  Indicator: string;
  IndicatorLabelTable: string;
  IndicatorDescription: string;
  TranslationKey: string;
  DataKey: string;
  AggregationLevel: string,
  BinningRangeLarge: number[];
}

export interface IndicatorMetaDataWithYear extends IndicatorMetaDataType {
  years: number[];
}

export interface DashboardFilters {
  funding: string;
  genderMarker: string;
  category: string;
  subCategory: string;
  bureau: string;
  economy: string;
  hdiTier: string;
  specialGrouping: string;
  continentRegion: string;
  subRegion: string;
  sahel: string;
  crisis: string;
  countryCode: string;
}

export type DashboardFilterKey = keyof DashboardFilters;

export interface FilterOption {
  value: string;
  label: string;
  aliases: string[];
}

export interface FilterCatalog {
  optionsByKey: Record<DashboardFilterKey, FilterOption[]>;
}

export interface AppliedFilterIntent {
  filters: Partial<DashboardFilters>;
  unresolvedTerms: string[];
}

export interface CountryMetadataRow {
  'Country Name': string;
  'Country Code': string;
  m49?: string;
  Region: string;
  Economy: string;
  HDI: string;
  LDC: string;
  SIDS: string;
  LLDC: string;
  Sahel: string;
  Crisis: string;
  'continent-region': string;
  'sub-region': string;
  'sids-region'?: string;
  'un-member'?: string;
  'undp-sids'?: string;
  'un-region'?: string;
  'Unnamed: 17'?: string;
  'Project Count'?: number;
  'Output Count'?: number;
  'Budget Total'?: number;
  'Direct Beneficiaries'?: number;
}

export interface BeneficiaryCategoryMetric {
  category: string;
  value: number;
}

export interface SummaryMetrics {
  projectCount: number;
  countryCount: number;
  totalBudget: number;
  directBeneficiaries: number;
  vfBeneficiaries: number;
  nonVfBeneficiaries: number;
  cleanElectricityBeneficiaries: number;
  cleanCookingBeneficiaries: number;
  productiveUseBeneficiaries: number;
  policyProjectCount: number;
  topBeneficiaryCategories: BeneficiaryCategoryMetric[];
}

export interface RankedProject {
  id: string;
  title: string;
  link: string;
  countryName: string;
  description: string;
  budget: number;
  directBeneficiaries: number;
  primaryOutputCategories: string[];
}

export interface ProjectSynopsisContext {
  totalProjects: number;
  topProjects: RankedProject[];
}

export interface AssistantParseResponse {
  filters: Partial<DashboardFilters>;
  unresolvedTerms: string[];
}

export interface AssistantProjectSynopsisRequest {
  query: string;
  locale: string;
  filters: DashboardFilters;
  summaryMetrics: SummaryMetrics;
  projectContext: ProjectSynopsisContext;
}

export interface AssistantProjectSynopsisResponse {
  synopsis: string;
}

export interface HoverDataType {
  country: string;
  continent: string;
  peopleDirectlyBenefiting?: number;
  grantAmount?: number;
  outputCategory?: string;
  numberProjects?: number;
  xPosition: number;
  yPosition: number;
}

export interface ProjectHoverDataType {
  name: string,
  donor: string,
  grantAmount: undefined | number;
  xPosition: number;
  yPosition: number;
}

export interface CtxDataType {
  filters: DashboardFilters;
  xAxisIndicator: string;
  updateDashboardFilter: (_key: DashboardFilterKey, _value: string) => void;
  applyDashboardFilters: (_filters: Partial<DashboardFilters>) => void;
  resetDashboardFilters: () => void;
  updateXAxisIndicator: (_d: string) => void;
}

export interface CountryIndicatorMetaDataType {
  Indicator: string;
  IndicatorLabelTable: string;
  IndicatorDescription: string;
  Unit: string;
  FileNumber: number;
}
export interface CountryIndicatorDataType {
  indicator: string;
  value: any;
  year: any;
}
export interface CountryData {
  country: string;
  values: CountryIndicatorDataType[];
}
export interface ProjectLevelDataType {
  id: string,
  title: string,
  description: string,
  countryName: string,
  countryCode: string,
  projectTitle: string,
  country: string,
  link: string,
  donors: string[] | null,
  region: string,
  verticalFunded: boolean,
  flagship: string,
  budget: number,
  outputCount: number,
  genderMarker: string,
  dirBeneficiaries: number,
  indirBeneficiaries: number,
  fundingSources: string,
  hdiTier: string,
  projectDescription: string,
  outputs: any[],
  thematics: string[],
  incomeGroup: string,
  specialGroupings: string[],
  regionBureau: string,
  'projectID_PIMS+': number,
  'projectID_Atlas': number,
  'Short Title': string,
  'Project Description'?: string,
  'Lead Country': string,
  'Regional Bureau': string,
  'Source of Funds': string,
  taxonomy_level3?: string,
  'Grant amount': number,
  'target_Electricity access'?: number,
  'target_Clean cooking'?: number,
  'target_Energy services'?: number,
  'target_total'?: number,
  'results_Electricity access'?: number,
  'results_Clean cooking'?: number,
  'results_Energy services'?: number,
  'results_total'?: number,
  'investment gap'?: number,
  'Partners': string,
  Source_documentation: string,
  Status?: string,
  status?: string,
  'Start Year'?: string | number,
  startYear?: string | number,
  'End Year'?: string | number,
  endYear?: string | number,
  'Project Number'?: string | number,
  projectNumber?: string | number,
  projectDocumentUrl?: string,
  projectDocumentURL?: string,
  project_document_url?: string,
  prodocUrl?: string,
  prodocURL?: string,
  prodoc_url?: string,
  'Project Document URL'?: string,
  'Project Document'?: string,
}
export interface ProjectCoordsDataType {
  'projectID_PIMS+': number,
  'projectID_Atlas': number,
  projectData: ProjectLevelDataType,
  Latitude: number,
  Longitude: number,
}
export interface DashboardDataType {
  peopleBenefiting: number;
  grantAmount: number;
  numberProjects: number;
}

interface LowLevelTaxonomy {
  label: string,
  value: string,
}

export interface Taxonomy {
  label: string,
  value?: string | null,
  key?: string,
  options?: LowLevelTaxonomy[]
}

export interface OutputsTaxonomy {
  label: string,
  value: string,
  subcategories: LowLevelTaxonomy[]
}

export interface IndicatorRange {
  [key: string]: number[],
}
// export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://raw.githubusercontent.com/UNDP-Data/Energy-Hub-Dashboard/development/public' : '.';
export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://undp-data.github.io/fe-energy-moonshot' : '/fe-energy-moonshot';

export const getAssetPath = (assetPath: string) => {
  const normalizedAssetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${ROOT_DIR}${normalizedAssetPath}`;
};
