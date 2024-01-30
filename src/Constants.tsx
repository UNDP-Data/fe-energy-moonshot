export const CONTINENTS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export const MAX_TEXT_LENGTH = 100;

export const TRUNCATE_MAX_TEXT_LENGTH = 125;

export const DEFAULT_VALUES = {
  firstMetric: 'Direct Beneficiaries',
  secondMetric: 'Tonnes of CO2 emissions reduced',
  colorMetric: 'Continents',
};

export const INCOME_GROUPS = ['Low income', 'Lower middle income', 'Upper middle income', 'High income'];

export const HDI_LEVELS = ['Low', 'Medium', 'High', 'Very High'];

export const COLOR_SCALES = {
  Null: '#D4D6D8',
  Linear: {
    RedColor4: ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'],
    RedColor5: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
    RedColor6: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
    RedColor7: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
    RedColor8: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
    RedColor9: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    RedColor10: ['#ffffd9', '#e4f4cb', '#c4e6c3', '#9dd4c0', '#69c1c1', '#3ea2bd', '#347cab', '#265994', '#173978', '#081d58'],
    GreenColor4: ['#ffffcc', '#c2e699', '#78c679', '#238443'],
    GreenColor5: ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'],
    GreenColor6: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'],
    GreenColor7: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'],
    GreenColor8: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'],
    GreenColor9: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    GreenColor10: [
      'rgb(250, 250, 110)',
      'rgb(217, 233, 101)',
      'rgb(186, 216, 94)',
      'rgb(157, 198, 87)',
      'rgb(129, 180, 81)',
      'rgb(103, 162, 76)',
      'rgb(78, 144, 70)',
      'rgb(55, 126, 64)',
      'rgb(31, 108, 57)',
      'rgb(0, 90, 50)',
    ],
  },
  Divergent: {
    Color4: [
      '#d7191c',
      '#fdae61',
      '#abdda4',
      '#2b83ba',
    ],
    Color5: [
      '#d7191c',
      '#fdae61',
      '#ffffbf',
      '#abdda4',
      '#2b83ba',
    ],
    Color6: [
      '#d53e4f',
      '#fc8d59',
      '#fee08b',
      '#e6f598',
      '#99d594',
      '#3288bd',
    ],
    Color7: [
      '#d53e4f',
      '#fc8d59',
      '#fee08b',
      '#ffffbf',
      '#e6f598',
      '#99d594',
      '#3288bd',
    ],
    Color8: [
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
    ],
    Color9: [
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#ffffbf',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
    ],
    Color10: [
      '#9e0142',
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
      '#5e4fa2',
    ],
    Color11: [
      '#9e0142',
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#ffffbf',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
      '#5e4fa2',
    ],
  },
  Categorical: [
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
    '#a65628',
    '#e41a1c',
    '#f781bf',
    '#ffff33',
  ],
  Bivariate5x5: [
    ['#e5e5e5', '#BAE7F6', '#7FDCF9', '#41D0FC', '#0BC6FF'],
    ['#F6C5D4', '#BFBEDD', '#88B8E5', '#57B2ED', '#21ABF5'],
    ['#F99FBA', '#C89BC6', '#9697D3', '#6494DF', '#3690EB'],
    ['#F782A5', '#D180B3', '#9F7DC5', '#727AD4', '#4978E3'],
    ['#F4618D', '#D2619F', '#A961B3', '#8061C8', '#5C61DA'],
  ],
  Bivariate4x4: [
    ['#e5e5e5', '#BAE7F6', '#7FDCF9', '#41D0FC'],
    ['#F6C5D4', '#BFBEDD', '#88B8E5', '#57B2ED'],
    ['#F99FBA', '#C89BC6', '#9697D3', '#6494DF'],
    ['#F782A5', '#D180B3', '#9F7DC5', '#727AD4'],
  ],
  Bivariate5x4: [
    ['#e5e5e5', '#BAE7F6', '#7FDCF9', '#41D0FC'],
    ['#F6C5D4', '#BFBEDD', '#88B8E5', '#57B2ED'],
    ['#F99FBA', '#C89BC6', '#9697D3', '#6494DF'],
    ['#F782A5', '#D180B3', '#9F7DC5', '#727AD4'],
    ['#F4618D', '#D2619F', '#A961B3', '#8061C8'],
  ],
  Bivariate4x5: [
    ['#e5e5e5', '#BAE7F6', '#7FDCF9', '#41D0FC', '#0BC6FF'],
    ['#F6C5D4', '#BFBEDD', '#88B8E5', '#57B2ED', '#21ABF5'],
    ['#F99FBA', '#C89BC6', '#9697D3', '#6494DF', '#3690EB'],
    ['#F782A5', '#D180B3', '#9F7DC5', '#727AD4', '#4978E3'],
  ],
};

export const outputsTaxonomy = [
  {
    value: 'all',
    label: 'all',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
      {
        value: 'Access',
        label: 'access',
      },
      {
        value: 'Transition',
        label: 'transition',
      },
      {
        value: 'Productive Use',
        label: 'productive-use',
      },
      {
        value: 'Policy',
        label: 'policy',
      },
      {
        value: 'Finance',
        label: 'finance',
      },
    ],
  },
  {
    value: 'Energy Access',
    label: 'access',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
      {
        value: 'Solar',
        label: 'solar',
      },
      {
        value: 'Hydro',
        label: 'hydro',
      },
      {
        value: 'Wind',
        label: 'wind',
      },
      {
        value: 'Geothermal',
        label: 'geothermal',
      },
      {
        value: 'Biomass',
        label: 'biomass',
      },
      {
        value: 'Clean Cooking',
        label: 'clean-cooking',
      },
    ],
  },
  {
    value: 'Energy Transition',
    label: 'transition',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
      {
        value: 'Solar',
        label: 'solar',
      },
      {
        value: 'Hydro',
        label: 'hydro',
      },
      {
        value: 'Wind',
        label: 'wind',
      },
      {
        value: 'Geothermal',
        label: 'geothermal',
      },
      {
        value: 'Biomass',
        label: 'biomass',
      },
    ],
  },
  {
    value: 'Productive Use',
    label: 'productive-use',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
      {
        value: 'Health Services',
        label: 'health',
      },
      {
        value: 'Education Services',
        label: 'education',
      },
      {
        value: 'Water Services',
        label: 'water',
      },
      {
        value: 'Agriculture and Food System',
        label: 'agriculture',
      },
      {
        value: 'Energy Infrastructure Services',
        label: 'infrastructure',
      },
      {
        value: 'Transportation and E-mobility Services',
        label: 'transport',
      },
    ],
  },
  {
    label: 'policy',
    value: 'Policy',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
    ],
  },
  {
    label: 'finance',
    value: 'Market Development',
    subcategories: [
      {
        value: 'all',
        label: 'all',
      },
    ],
  },
];

export const countryGroupingsTaxonomy = [
  {
    label: 'all-country-groupings',
    value: 'all',
  },
  {
    label: 'regional-bureaus',
    key: 'region',
    options: [
      {
        label: 'RBLAC',
        value: 'RBLAC',
      },
      {
        label: 'RBA',
        value: 'RBA',
      },
      {
        label: 'RBAP',
        value: 'RBAP',
      },
      {
        label: 'RBEC',
        value: 'RBEC',
      },
      {
        label: 'RBAS',
        value: 'RBAS',
      },
    ],
  },
  {
    label: 'income-groups',
    key: 'incomeGrouping',
    options: [
      {
        label: 'high-income',
        value: 'High income',
      },
      {
        label: 'upper-middle-income',
        value: 'Upper middle income',
      },
      {
        label: 'lower-middle-income',
        value: 'Lower middle income',
      },
      {
        label: 'low-income',
        value: 'Low income',
      },
    ],
  },
  {
    label: 'hdi-tiers',
    key: 'hdiTier',
    options: [
      {
        label: 'very-high',
        value: 'Very High',
      },
      {
        label: 'high',
        value: 'High',
      },
      {
        label: 'medium',
        value: 'Medium',
      },
      {
        label: 'low',
        value: 'Low',
      },
    ],
  },
  {
    label: 'special-groupings',
    key: 'specialGroupings',
    options: [
      {
        label: 'sids',
        value: 'SIDS',
      },
      {
        label: 'lldcs',
        value: 'LLDC',
      },
      {
        label: 'ldcs',
        value: 'LDC',
      },
    ],
  },
];

export const genderMarkers = [
  {
    label: 'all',
    value: 'all',
  },
  {
    label: 'GEN0',
    value: 'GEN0',
    tooltip: 'GEN0-tooltip',
  },
  {
    label: 'GEN1',
    value: 'GEN1',
    tooltip: 'GEN1-tooltip',
  },
  {
    label: 'GEN2',
    value: 'GEN2',
    tooltip: 'GEN2-tooltip',
  },
  {
    label: 'GEN3',
    value: 'GEN3',
    tooltip: 'GEN3-tooltip',
  },
];

export const fundingTaxonomy = [
  {
    value: 'all',
    label: 'all-funding-sources',
  },
  {
    value: 'vf',
    label: 'vf',
  },
  {
    value: 'nonvf',
    label: 'non-vf',
  },
];
