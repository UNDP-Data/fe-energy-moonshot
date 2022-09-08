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

export interface ProjectDataType {
  'Lead Country': string,
  'project_id': number,
  'status': 'Completed' | 'Active'
  'Short Title': string,
  'Region': string,
  'Number of projects': number,
  grant_amount_vertical_fund?: number,
  expenses_vertical_fund?: number,
  cofinancing_vertical_fund?: number,
  taxonomy?: string;
}

export interface ProjectCoordinateDataType {
  project_id: number,
  'Short Title': string,
  'Sources of Funds': string,
  'Programme Period': string,
  'Lead Country': string,
  Region: string,
  'Participating Countries': string,
  Latitude: number,
  Longitude: number,
  Scope: 'Country' | 'Region',
  'Grant Amount'?: number,
  'GL Expenses'?: number,
  'Co-Financing'?: number,
  status: 'Completed' | 'Active',
  taxonomy?: string;
}

export interface HoverDataType {
  country: string;
  continent: string;
  peopleDirectlyBenefiting?: number;
  emissionsReduced?: number;
  grantAmountVerticalFund?: number;
  expensesVerticalFund?: number;
  coFinancingVerticalFund?: number;
  numberProjects?: number;
  xPosition: number;
  yPosition: number;
}

export interface ProjectHoverDataType {
  name: string,
  donor: string,
  timeframe: string,
  status: string,
  grantAmount: undefined | number;
  expenses: undefined | number;
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
