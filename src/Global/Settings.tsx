import {
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
    applyDashboardFilters,
  } = useContext(Context) as CtxDataType;
  const selectedCategory = filters.category;
  const selectedSubCategory = filters.subCategory;
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localSubCategory, setLocalSubCategory] = useState(selectedSubCategory);
  // translation
  const { t } = useTranslation();

  useEffect(() => {
    setLocalCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setLocalSubCategory(selectedSubCategory);
  }, [selectedSubCategory]);

  const outputsTaxonomyTranslated = useMemo(() => outputsTaxonomy.map((ot) => ({
    value: ot.value,
    label: t(ot.label),
    subcategories: ot.subcategories.map((ots) => ({
      value: ots.value,
      label: t(ots.label),
    })),
  })), [t]);

  const subCategoriesTaxonomy = useMemo(() => {
    const activeOutputsTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === localCategory)
      || outputsTaxonomyTranslated[0];
    return activeOutputsTaxonomy?.subcategories;
  }, [outputsTaxonomyTranslated, localCategory]);

  useEffect(() => {
    const selectedSubCategoryIsValid = subCategoriesTaxonomy
      ?.some((subCategory) => subCategory.value === localSubCategory);

    if (localSubCategory !== 'all' && !selectedSubCategoryIsValid) {
      setLocalSubCategory('all');
      startTransition(() => {
        updateDashboardFilter('subCategory', 'all');
      });
    }
  }, [localSubCategory, subCategoriesTaxonomy, updateDashboardFilter]);

  const handleCategoryChange = (value: string) => {
    const nextCategory = String(value);
    const nextTaxonomy = outputsTaxonomyTranslated.find((category) => category.value === nextCategory)
      || outputsTaxonomyTranslated[0];
    const currentSubCategoryIsValid = nextTaxonomy?.subcategories
      ?.some((subCategory) => subCategory.value === localSubCategory);
    const nextSubCategory = localSubCategory !== 'all' && !currentSubCategoryIsValid
      ? 'all'
      : localSubCategory;

    setLocalCategory(nextCategory);
    setLocalSubCategory(nextSubCategory);

    startTransition(() => {
      applyDashboardFilters({
        category: nextCategory,
        subCategory: nextSubCategory,
      });
    });
  };

  const handleSubCategoryChange = (value: string) => {
    const nextSubCategory = String(value);
    setLocalSubCategory(nextSubCategory);
    startTransition(() => {
      updateDashboardFilter('subCategory', nextSubCategory);
    });
  };

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
              onChange={(value) => { handleCategoryChange(String(value)); }}
              value={localCategory}
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
              disabled={localCategory === 'all'}
              onChange={(value) => { handleSubCategoryChange(String(value)); }}
              value={localSubCategory}
              options={subCategoriesTaxonomy}
            />
          </SelectorControl>
        </SelectorRow>
      </div>
    </SelectorStack>
  );
};
