import { useContext, useEffect, useState } from 'react';
import { Select, Segmented, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType } from '../Types';
import Context from '../Context/Context';
import {
  outputsTaxonomy, countryGroupingsTaxonomy, genderMarkers, fundingTaxonomy,
} from '../Constants';

interface Props {
  countryList: string[];
}

export const Settings = (props: Props) => {
  const {
    selectedRegions,
    selectedFunding,
    selectedGenderMarker,
    selectedCategory,
    selectedSubCategory,
    updateSelectedRegions,
    updateSelectedFunding,
    updateSelectedGenderMarker,
    updateSelectedCategory,
    updateSelectedSubCategory,
  } = useContext(Context) as CtxDataType;
  // translation
  const { t } = useTranslation();

  const { countryList } = props;

  const outputsTaxonomyTranslated = outputsTaxonomy.map((ot) => ({
    value: ot.value,
    label: t(ot.label),
    subcategories: ot.subcategories.map((ots) => ({
      value: ots.value,
      label: t(ots.label),
    })),
  }));

  const [subCategoriesTaxonomy, setSubCategoriesTaxonomy] = useState(() => {
    const activeOutputsTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === selectedCategory)
      || outputsTaxonomyTranslated[0];
    return activeOutputsTaxonomy?.subcategories;
  });

  const countryGroupingsMerged = [...countryGroupingsTaxonomy];
  countryGroupingsMerged.push({
    label: 'countries',
    key: 'countries',
    options: countryList.map((c) => ({
      label: c,
      value: c,
    })),
  });

  useEffect(() => {
    updateSelectedSubCategory('all');
    const activeOutputsTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === selectedCategory)
      || outputsTaxonomyTranslated[0];
    setSubCategoriesTaxonomy(activeOutputsTaxonomy.subcategories);
  }, [selectedCategory]);

  return (
    <div>
      <div className='margin-bottom-04'>
        <p className='undp-typography label'>{t('select-output-type')}</p>
        <Segmented
          className='undp-segmented-small'
          block
          // @ts-ignore
          onChange={(d:string) => { updateSelectedCategory(d); }}
          value={selectedCategory}
          options={outputsTaxonomyTranslated}
        />
      </div>
      <div className='margin-bottom-07 margin-left-05'>
        <p className='undp-typography label'>{t('select-output-sub-type')}</p>
        <div className='flex-div flex-space-between'>
          <Segmented
            className='undp-segmented-small'
            block
            style={{ width: '100%' }}
            disabled={selectedCategory === 'all'}
            // @ts-ignore
            onChange={(d:string) => { updateSelectedSubCategory(d); }}
            value={selectedSubCategory}
            options={subCategoriesTaxonomy}
          />
        </div>
      </div>
      <div className='flex-div flex-space-between margin-bottom-07'>
        <div style={{ maxWidth: 'calc(33.33% - .65rem)', width: '100%' }}>
          <p className='label'>{t('select-country-group')}</p>
          <Select
            showSearch
            className='undp-select'
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            placeholder={t('select-country-group')}
            value={selectedRegions}
            onChange={(d: string) => { updateSelectedRegions(d === undefined ? 'all' : d); }}
          >
            {
              countryGroupingsMerged.map((d) => {
                if (d.options) {
                  return (
                    <Select.OptGroup key={d.key} label={t(d.label)}>
                      {d.options.map((o) => (
                        <Select.Option
                          className='undp-select-option'
                          label={t(o.label)}
                          key={o.value}
                        >
                          {t(o.label)}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  );
                }
                return (
                  <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>{t(d.label)}</Select.Option>
                );
              })
            }
          </Select>
        </div>
        <div style={{ maxWidth: 'calc(33.33% - .65rem)', width: '100%' }}>
          <Tooltip
            title={<div dangerouslySetInnerHTML={{ __html: t('gender-marker-tooltip') || '' }} />}
            placement='top'
            overlayStyle={{
              maxWidth: '550px',
            }}
          >
            <p className='label underline'>{ t('select-gender-marker')}</p>
          </Tooltip>
          <Select
            showSearch
            className='undp-select'
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            placeholder={t('select-taxonomy')}
            value={selectedGenderMarker}
            onChange={(d: string) => { updateSelectedGenderMarker(d === undefined ? 'all' : d); }}
          >
            {
              genderMarkers.map((d) => (
                <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>
                  { d.tooltip ? (
                    <Tooltip title={t(d.tooltip)}>
                      {t(d.label)}
                    </Tooltip>
                  ) : (
                    t(d.label)
                  )}
                </Select.Option>
              ))
            }
          </Select>
        </div>
        <div style={{ maxWidth: 'calc(33.33% - .65rem)', width: '100%' }}>
          <p className='label'>{t('select-funding')}</p>
          <Select
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            className='undp-select'
            placeholder={t('select-funding')}
            value={selectedFunding}
            onChange={(d: string) => { updateSelectedFunding(d === undefined ? 'all' : d); }}
          >
            {
              fundingTaxonomy.map((d) => (
                <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>{t(d.label)}</Select.Option>
              ))
            }
          </Select>
        </div>
      </div>
    </div>
  );
};
