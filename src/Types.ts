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
  'PIMS ID': string,
  'Lead Country': string,
  'Region': string,
  'Participating Countries': string,
  'Latitude': number,
  'Longitude': number,
  'Scope': 'Country' | 'Region',
  'Grant Amount': undefined | number,
  'GL Expenses': undefined | number,
  'Co-Financing': undefined | number,
  'people directly benefiting': undefined | number;
  'people indirectly benefiting': undefined | number;
  'tonnes of CO2-eq emissions avoided or reduced': undefined | number,
  'km of coast strengthened and/or better managed for climate change': undefined | number,
  'status': 'Completed' | 'Active'
}

export interface HoverDataType {
  country: string;
  continent: string;
  peopleDirectlyBenefiting: undefined | number;
  emissionsReduced: undefined | number;
  grantAmount: undefined | number;
  expenses: undefined | number;
  coFinancing: undefined | number;
  xPosition: number;
  yPosition: number;
}

export interface CtxDataType {
  selectedRegions: string;
  selectedCountries: string;
  xAxisIndicator: string;
  showProjectLocations: boolean;
  updateSelectedRegions: (_d: string) => void;
  updateSelectedCountries: (_d: string) => void;
  updateXAxisIndicator: (_d: string) => void;
  updateShowProjectLocations: (_d: boolean) => void;
}
