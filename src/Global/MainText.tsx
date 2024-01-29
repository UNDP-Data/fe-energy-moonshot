import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  outputsTaxonomy, countryGroupingsTaxonomy, genderMarkers, fundingTaxonomy,
} from '../Constants';
import Context from '../Context/Context';
import { CtxDataType, Taxonomy, OutputsTaxonomy } from '../Types';

export const MainText = () => {
  const {
    selectedRegions,
    selectedFunding,
    selectedGenderMarker,
    selectedCategory,
    selectedSubCategory,
  } = useContext(Context) as CtxDataType;

  const { t } = useTranslation();
  const getTextLabel = (taxonomyObj:Taxonomy[], value:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === value) return t(group.label);
    if (group.options) {
      const validOption = group.options.find((o) => o.value === value);
      if (validOption) {
        return `${t(group.label)} - ${t(validOption.label)}`;
      }
    }
    return groupingText;
  }, '');

  const getCategoryLabel = (taxonomyObj:OutputsTaxonomy[], category:string, subcategory:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === category) {
      const validOption = group.subcategories.find((o) => o.value === subcategory);
      if (validOption) return `${t(group.label)} - ${t(validOption.label)}`;
      return `${t(group.label)} - ${t('all')}`;
    }
    return groupingText;
  }, '');

  const countryGroupings = getTextLabel(countryGroupingsTaxonomy, selectedRegions);
  const fundingSources = getTextLabel(fundingTaxonomy, selectedFunding);
  const taxonomy = getTextLabel(genderMarkers, selectedGenderMarker);
  const outputCategory = getCategoryLabel(outputsTaxonomy, selectedCategory, selectedSubCategory);
  return (
    <div className='margin-bottom-05'>
      <p className='undp-typography'>
        {
          t('main-text',
            {
              countryGroupings,
              fundingSources,
              taxonomy,
              outputCategory,
            })
        }
      </p>
    </div>
  );
};
