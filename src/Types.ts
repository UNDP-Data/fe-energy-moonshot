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

export interface IndicatorDataType {
  indicator: string;
  value?: number;
}

export interface DataType extends CountryGroupDataType {
  indicators: IndicatorDataType[];
  indicatorsAvailable: string[];
}

export interface IndicatorMetaDataType {
  Pillar: string[];
  Goal: string[];
  Indicator: string;
  IndicatorLabelTable: string;
  IndicatorDescription: string;
  DataKey: string;
  DataSourceName: string;
  DataSourceLink: string;
  LabelSuffix?: string;
  LabelPrefix?: string;
  LabelFormat?: string;
  BinningRange5: number[];
  BinningRangeLarge: number[];
  Categories: number[];
  CategorizeByRanking?: boolean;
  IsCategorical?: boolean;
  IsDivergent?: boolean;
  ScatterPlot?: boolean;
  Map?: boolean;
  BarGraph?: boolean;
  Sizing?: boolean;
  Color?: boolean;
}

export interface IndicatorMetaDataWithYear extends IndicatorMetaDataType {
  years: number[];
}

export interface ProjectCoordinateDataType {
  'project_id': number,
  'Short Title': string,
  'Sources of Funds': string,
  'Programme Period': string,
  'Lead Country': string,
  'Region': string,
  'Participating Countries': string,
  'Latitude': number,
  'Longitude': number,
  'Scope': 'Country' | 'Region',
  'Grant Amount': undefined | number,
  'GL Expenses': undefined | number,
  'Co-Financing': undefined | number,
  'status': 'Completed' | 'Active'
}

export interface HoverDataType {
  country: string;
  continent: string;
  peopleDirectlyBenefiting: undefined | number;
  emissionsReduced: undefined | number;
  grantAmountVerticalFund: undefined | number;
  expensesVerticalFund: undefined | number;
  coFinancingVerticalFund: undefined | number;
  grantAmountNonVerticalFund: undefined | number;
  expensesNonVerticalFund: undefined | number;
  coFinancingNonVerticalFund: undefined | number;
  numberProjects: undefined | number;
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
  updateSelectedRegions: (_d: string) => void;
  updateSelectedCountries: (_d: string) => void;
  updateSelectedProjects: (_d: string) => void;
  updateXAxisIndicator: (_d: string) => void;
  updateShowProjectLocations: (_d: boolean) => void;
}
