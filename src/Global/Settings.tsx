import { useContext, useEffect, useState } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType } from '../Types';
import Context from '../Context/Context';
import { outputsTaxonomy } from '../Constants';

export const Settings = () => {
  const {
    selectedCategory,
    selectedSubCategory,
    updateSelectedCategory,
    updateSelectedSubCategory,
  } = useContext(Context) as CtxDataType;
  // translation
  const { t } = useTranslation();

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

  useEffect(() => {
    updateSelectedSubCategory('all');
    const activeOutputsTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === selectedCategory)
      || outputsTaxonomyTranslated[0];
    setSubCategoriesTaxonomy(activeOutputsTaxonomy.subcategories);
  }, [selectedCategory]);

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
          // @ts-ignore
          onChange={(d:string) => { updateSelectedCategory(d); }}
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
            // @ts-ignore
            onChange={(d:string) => { updateSelectedSubCategory(d); }}
            value={selectedSubCategory}
            options={subCategoriesTaxonomy}
          />
        </div>
      </div>
    </div>
  );
};
