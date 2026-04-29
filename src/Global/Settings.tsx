import { useContext, useEffect, useMemo } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CtxDataType } from '../Types';
import Context from '../Context/Context';
import { outputsTaxonomy } from '../Constants';

const SelectorRow = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  width: 100%;
  @media (max-width: 960px) {
    align-items: stretch;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const SelectorLabel = styled.p`
  color: var(--gray-700);
  flex: 0 0 11rem;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  @media (max-width: 960px) {
    flex: none;
  }
`;

const SelectorControl = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const SelectorStack = styled.div`
  margin-bottom: 0.35rem;
`;

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
    const selectedSubCategoryIsValid = subCategoriesTaxonomy
      ?.some((subCategory) => subCategory.value === selectedSubCategory);

    if (selectedSubCategory !== 'all' && !selectedSubCategoryIsValid) {
      updateDashboardFilter('subCategory', 'all');
    }
  }, [selectedCategory, selectedSubCategory, subCategoriesTaxonomy, updateDashboardFilter]);

  return (
    <SelectorStack>
      <div
        style={{
        /*   maxWidth: '1200px', */
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        className='margin-bottom-00'
      >
        <SelectorRow>
          <SelectorLabel>{t('beneficiary-categories')}</SelectorLabel>
          <SelectorControl>
            <Segmented
              className='undp-segmented-small padding-bottom-00 padding-left-00 padding-right-00 data-platform-segmented'
              block
              onChange={(value) => { updateDashboardFilter('category', String(value)); }}
              value={selectedCategory}
              options={outputsTaxonomyTranslated}
            />
          </SelectorControl>
        </SelectorRow>
      </div>
      <div
        style={{
          /* maxWidth: '1200px', */
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        className='margin-left-auto margin-right-auto'
      >
        <SelectorRow>
          <SelectorLabel>{t('subcategories')}</SelectorLabel>
          <SelectorControl>
            <Segmented
              className='undp-segmented-small data-platform-segmented-small padding-top-00 padding-bottom-00 padding-left-00 padding-right-00'
              block
              style={{ width: '100%' }}
              disabled={selectedCategory === 'all'}
              onChange={(value) => { updateDashboardFilter('subCategory', String(value)); }}
              value={selectedSubCategory}
              options={subCategoriesTaxonomy}
            />
          </SelectorControl>
        </SelectorRow>
      </div>
    </SelectorStack>
  );
};
