import { useContext, useEffect, useState } from 'react';
import { Select, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType } from '../Types';
import Context from '../Context/Context';

// interface Props {
//   regions: RegionDataType[];
// }

export const Settings = () => {
  // const {
  //   regions,
  // } = props;
  const {
    // selectedRegions,
    // selectedTaxonomy,
    selectedCategory,
    selectedSubCategory,
    // selectedSubSubCategory,
    // updateSelectedRegions,
    // updateSelectedTaxonomy,
    updateSelectedCategory,
    updateSelectedSubCategory,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');

  // translation
  const { t } = useTranslation();

  const outputsTaxonomy = [
    {
      value: 'all',
      label: t('all'),
      subcategories: [
        {
          value: 'all',
          label: t('all'),
        },
        {
          value: 'solar',
          label: t('solar'),
        },
        {
          value: 'wind',
          label: t('wind'),
        },
        {
          value: 'geothermal',
          label: t('geothermal'),
        },
        {
          value: 'biomass',
          label: t('biomass'),
        },
      ],
    },
    {
      value: 'energyAccess',
      label: t('energy-access'),
      subcategories: [
        {
          value: 'all',
          label: t('all'),
        },
        {
          value: 'cleanElectricity',
          label: t('clean-electricity'),
          subcategories: [
            {
              value: 'all',
              label: t('all'),
            },
            {
              value: 'solar',
              label: t('solar'),
            },
            {
              value: 'wind',
              label: t('wind'),
            },
            {
              value: 'geothermal',
              label: t('geothermal'),
            },
            {
              value: 'biomass',
              label: t('biomass'),
            },
          ],
        },
        {
          value: 'cleanCooking',
          label: t('clean-cooking'),
        },
      ],
    },
    {
      value: 'energyTransition',
      label: t('energy-transition'),
      subcategories: [
        {
          value: 'all',
          label: t('All'),
        },
        {
          value: 'solar',
          label: t('solar'),
        },
        {
          value: 'wind',
          label: t('wind'),
        },
        {
          value: 'geothermal',
          label: t('Geothermal'),
        },
        {
          value: 'biomass',
          label: t('biomass'),
        },
      ],
    },
    {
      value: 'productiveUse',
      label: t('productive-use'),
      subcategories: [
        {
          value: 'all',
          label: t('all'),
        },
        {
          value: 'healthServices',
          label: t('health'),
        },
        {
          value: 'educationServices',
          label: t('education'),
        },
        {
          value: 'AgricultureAndFoodSystems',
          label: t('agriculture'),
        },
        {
          value: 'WaterServices',
          label: t('water'),
        },
      ],
    },
  ];

  const countryGroupingsTaxonomy = [
    {
      label: t('all-country-groupings'),
      value: 'all',
    },
    {
      label: t('regional-bureaus'),
      key: 'region',
      options: [
        {
          label: t('RBLAC'),
          value: 'RBLAC',
        },
        {
          label: t('RBA'),
          value: 'RBA',
        },
        {
          label: t('RBAP'),
          value: 'RBAP',
        },
        {
          label: t('RBEC'),
          value: 'RBEC',
        },
        {
          label: t('RBAS'),
          value: 'RBAS',
        },
      ],
    },
    {
      label: t('income-groups'),
      key: 'incomeGrouping',
      options: [
        {
          label: t('high-income'),
          value: 'High income',
        },
        {
          label: t('upper-middle-income'),
          value: 'Upper middle income',
        },
        {
          label: t('lower-middle-income'),
          value: 'Lower middle income',
        },
        {
          label: t('low-income'),
          value: 'Low income',
        },
      ],
    },
    {
      label: t('hdi-tiers'),
      key: 'hdiTier',
      options: [
        {
          label: t('very-high'),
          value: 'Very High',
        },
        {
          label: t('high'),
          value: 'High',
        },
        {
          label: t('medium'),
          value: 'Medium',
        },
        {
          label: t('low'),
          value: 'Low',
        },
      ],
    },
    {
      label: t('special-groupings'),
      key: 'specialGroupings',
      options: [
        {
          label: t('sids'),
          value: 'SIDS',
        },
        {
          label: t('lldcs'),
          value: 'LLDCs',
        },
        {
          label: t('ldcs'),
          value: 'LDCs',
        },
      ],
    },
  ];

  const variousTaxonomy = [
    {
      label: t('all-taxonomies'),
      value: 'all',
    },
    {
      label: t('undp-flagships'),
      key: 'flagship',
      options: [
        {
          label: t('all'),
          value: 'allFlagships',
        },
        {
          label: t('amp'),
          value: 'AMP',
        },
        {
          label: t('solar-for-health'),
          value: 'Solar for Health',
        },
        {
          label: t('pudc'),
          value: 'PUDC',
        },
        {
          label: t('action-opportunities'),
          value: 'Action Opportunities',
        },
      ],
    },
    {
      label: t('thematics'),
      key: 'thematic',
      options: [
        {
          label: t('energy-finance'),
          value: 'Energy Finance',
        },
        {
          label: t('gender-equality'),
          value: 'Gender Equality',
        },
        {
          label: t('energy-governance'),
          value: 'Energy Governance',
        },
      ],
    },
  ];

  const fundingTaxonomy = [
    {
      value: 'all',
      label: t('all-funding-sources'),
    },
    {
      value: 'vf',
      label: t('vf'),
    },
    {
      value: 'nonvf',
      label: t('non-vf'),
    },
  ];

  const [subSubCategoriesTaxonomy, setSubSubCategoriesTaxonomy] = useState(() => {
    const activeOutputsTaxonomy = outputsTaxonomy.find((category) => category.value === selectedCategory) || outputsTaxonomy[0];
    let activeOutputsSubTaxonomy = outputsTaxonomy[0].subcategories[0];
    if (activeOutputsTaxonomy.subcategories) {
      activeOutputsSubTaxonomy = activeOutputsTaxonomy.subcategories.find((category) => category.value === selectedSubCategory) || outputsTaxonomy[0].subcategories[0];
    }
    return activeOutputsSubTaxonomy?.subcategories;
  });

  const [subCategoriesTaxonomy, setSubCategoriesTaxonomy] = useState(() => {
    const activeOutputsTaxonomy = outputsTaxonomy.find((category) => category.value === selectedCategory) || outputsTaxonomy[0];
    return activeOutputsTaxonomy?.subcategories;
  });

  useEffect(() => {
    updateSelectedSubCategory('all');
    const activeOutputsTaxonomy = outputsTaxonomy.find((category) => category.value === selectedCategory) || outputsTaxonomy[0];
    setSubCategoriesTaxonomy(activeOutputsTaxonomy.subcategories);
  }, [selectedCategory]);

  useEffect(() => {
    // updateSelectedSubCategory('all');
    const activeOutputsTaxonomy = outputsTaxonomy.find((category) => category.value === selectedCategory) || outputsTaxonomy[0];
    let activeOutputsSubTaxonomy = outputsTaxonomy[0].subcategories[0];
    if (activeOutputsTaxonomy.subcategories) {
      activeOutputsSubTaxonomy = activeOutputsTaxonomy.subcategories.find((category) => category.value === selectedSubCategory) || outputsTaxonomy[0].subcategories[0];
    }
    setSubSubCategoriesTaxonomy(activeOutputsSubTaxonomy?.subcategories);
  }, [selectedSubCategory]);

  return (
    <div>
      <div className='margin-bottom-04'>
        <p className='undp-typography label'>{t('select-output-type')}</p>
        <Segmented
          className='undp-segmented'
          block
          // @ts-ignore
          onChange={(d:string) => { updateSelectedCategory(d); }}
          value={selectedCategory}
          options={outputsTaxonomy}
        />
      </div>
      <div className='margin-bottom-07'>
        <p className='undp-typography label'>{t('select-output-sub-type')}</p>
        <div className='flex-div flex-space-between'>
          <Segmented
            className='undp-segmented'
            block
            style={{ width: '100%' }}
            disabled={selectedCategory === 'all'}
            // @ts-ignore
            onChange={(d:string) => { updateSelectedSubCategory(d); }}
            value={selectedSubCategory}
            options={subCategoriesTaxonomy}
          />
          { subSubCategoriesTaxonomy && subSubCategoriesTaxonomy?.length !== 0 ? (
            <Select
              className='undp-select'
              style={{ maxWidth: 'calc(33.333% - .65rem)' }}
              placeholder='Select a project taxonomy'
            >
              {
                subSubCategoriesTaxonomy.map((d) => (
                  <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
                ))
              }
            </Select>
          ) : null }
        </div>
      </div>
      <div className='flex-div flex-space-between margin-bottom-07'>
        <div style={{ width: 'calc(50% - 0.5rem)' }}>
          <p className='label'>{t('select-country-group')}</p>
          <Select
            className='undp-select'
            placeholder={t('select-country-group')}
          >
            {
              countryGroupingsTaxonomy.map((d) => {
                if (d.options) {
                  return (
                    <Select.OptGroup key={d.value} label={d.label}>
                      {d.options.map((o) => (
                        <Select.Option className='undp-select-option' key={o.value}>{o.label}</Select.Option>
                      ))}
                    </Select.OptGroup>
                  );
                }
                return (
                  <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
                );
              })
            }
          </Select>
        </div>
        <div style={{ width: 'calc(50% - 0.5rem)' }}>
          <p className='label'>{ t('select-taxonomy')}</p>
          <Select
            className='undp-select'
            placeholder={t('select-taxonomy')}
          >
            {
              variousTaxonomy.map((d) => {
                if (d.options) {
                  return (
                    <Select.OptGroup key={d.value} label={d.label}>
                      {d.options.map((o) => (
                        <Select.Option className='undp-select-option' key={o.value}>{o.label}</Select.Option>
                      ))}
                    </Select.OptGroup>
                  );
                }
                return (
                  <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
                );
              })
            }
          </Select>
        </div>
        <div style={{ width: `${!queryRegion ? 'calc(50% - 0.5rem)' : '100%'}` }}>
          <p className='label'>{ t('select-funding')}</p>
          <Select
            className='undp-select'
            placeholder={t('select-funding')}
            // value={selectedTaxonomy}
            // onChange={(d: string) => { updateSelectedTaxonomy(d === undefined ? 'All' : d); }}
          >
            {
              fundingTaxonomy.map((d) => (
                <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
              ))
            }
          </Select>
        </div>
      </div>
    </div>
  );
};
