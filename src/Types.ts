/* eslint-disable camelcase */
export interface CountryGroupDataType {
  'Alpha-2 code': string;
  'Alpha-3 code-1': string;
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
  DataKey: string;
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
  xAxisIndicator: string;
  showProjectLocations: boolean;
  selectedTaxonomy: string;
  updateSelectedRegions: (_d: string) => void;
  updateSelectedCountries: (_d: string) => void;
  updateSelectedProjects: (_d: string) => void;
  updateXAxisIndicator: (_d: string) => void;
  updateShowProjectLocations: (_d: boolean) => void;
  updateSelectedTaxonomy: (_d: string) => void;
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
  value: number;
  year: number;
}
export interface CountryData{
  country: string;
  values: CountryIndicatorDataType[];
}
export interface ProjectLevelDataType{
  'projectID_PIMS+': number,
  'projectID_Atlas': number,
  'Short Title': string,
  'Project Description'?: string,
  'Lead Country': string,
  'Regional Bureau': string,
  'Source of Funds': string,
  VF: string,
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
// export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://raw.githubusercontent.com/UNDP-Data/Energy-Hub-Dashboard/development/public' : '.';
export const ROOT_DIR = process.env.NODE_ENV === 'production' ? 'https://raw.githubusercontent.com/UNDP-Data/Energy-Hub-Dashboard/versionWithCountryIndicators/public/' : '.';
