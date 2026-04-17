import { useContext, useEffect, useMemo } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType } from '../Types';
import Context from '../Context/Context';
import { outputsTaxonomy } from '../Constants';

export const Settings = () => {
  const {
    filters,
    updateDashboardFilter,
  } = useContext(Context) as CtxDataType;
  const selectedCategory = filters.category;
  const selectedSubCategory = filters.subCategory;
  // translation
  const { t } = useTranslation();

  const outputsTaxonomyTranslated = useMemo(() => outputsTaxonomy.map((ot) => ({
    value: ot.value,
    label: t(ot.label),
    subcategories: ot.subcategories.map((ots) => ({
      value: ots.value,
      label: t(ots.label),
    })),
  })), [t]);

  const subCategoriesTaxonomy = useMemo(() => {
    const activeOutputsTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === selectedCategory)
      || outputsTaxonomyTranslated[0];
    return activeOutputsTaxonomy?.subcategories;
  }, [outputsTaxonomyTranslated, selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory !== 'all') {
      updateDashboardFilter('subCategory', 'all');
    }
  }, [selectedCategory, selectedSubCategory, updateDashboardFilter]);

  return (
    <div>
      <div
        style={{
        /*   maxWidth: '1200px', */
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        className='margin-bottom-00'
      >
        <Segmented
          className='undp-segmented-small padding-bottom-00 padding-left-00 padding-right-00 data-platform-segmented'
          block
          onChange={(value) => { updateDashboardFilter('category', String(value)); }}
          value={selectedCategory}
          options={outputsTaxonomyTranslated}
        />
      </div>
      <div
        style={{
          /* maxWidth: '1200px', */
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        className='margin-left-auto margin-right-auto margin-bottom-07'
      >
        <div className='flex-div flex-space-between'>
          <Segmented
            className='undp-segmented-small data-platform-segmented-small padding-top-00 padding-bottom-00 padding-left-00 padding-right-00'
            block
            style={{ width: '100%' }}
            disabled={selectedCategory === 'all'}
            onChange={(value) => { updateDashboardFilter('subCategory', String(value)); }}
            value={selectedSubCategory}
            options={subCategoriesTaxonomy}
          />
        </div>
      </div>
    </div>
  );
};
