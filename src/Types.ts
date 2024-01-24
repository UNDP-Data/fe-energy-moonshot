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

export interface HoverDataType {
  country: string;
  continent: string;
  peopleDirectlyBenefiting?: number;
  grantAmount?: number;
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
  selectedRegions: string;
  selectedCountries: string;
  selectedProjects: string;
  selectedCategory: string;
  selectedSubCategory: string;
  xAxisIndicator: string;
  selectedTaxonomy: string;
  selectedVariousTaxonomy: string;
  selectedFunding: string;
  updateSelectedRegions: (_d: string) => void;
  updateSelectedCountries: (_d: string) => void;
  updateSelectedProjects: (_d: string) => void;
  updateXAxisIndicator: (_d: string) => void;
  updateSelectedTaxonomy: (_d: string) => void;
  updateSelectedVariousTaxonomy: (_d: string) => void;
  updateSelectedFunding: (_d: string) => void;
  updateSelectedCategory: (_d: string) => void;
  updateSelectedSubCategory: (_d: string) => void;
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
export interface CountryData{
  country: string;
  values: CountryIndicatorDataType[];
}
export interface ProjectLevelDataType{
  projectId: string,
  title: string,
  description: string,
  countryName: string,
  projectTitle: string,
  country: string,
  region: string,
  verticalFunded: boolean,
  flagship: string,
  budget: number,
  outputCount: number,
  dirBeneficiaries: number,
  indirBeneficiaries: number,
  energySaved: number,
  ghgEmissions:number,
  fundingSources: string,
  hdiTier: string,
  outputs:any[],
  thematics:string[],
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
}
export interface ProjectCoordsDataType{
  'projectID_PIMS+': number,
  'projectID_Atlas': number,
  projectData: ProjectLevelDataType,
  Latitude: number,
  Longitude: number,
}
export interface DashboardDataType{
  peopleBenefiting: number;
  grantAmount: number;
  numberProjects: number;
}

interface LowLevelTaxonomy {
    label: string,
    value:string,
}

export interface Taxonomy {
  label: string,
  value?:string,
  key?:string,
  options?: LowLevelTaxonomy[]
}

export interface OutputsTaxonomy {
  label: string,
  value: string,
  subcategories: LowLevelTaxonomy[]
}
// export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://raw.githubusercontent.com/UNDP-Data/Energy-Hub-Dashboard/development/public' : '.';
export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://raw.githubusercontent.com/Lenseg/Energy-Hub-Dashboard/versionWithCountryIndicators/public/' : '.';
