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
  const getGenderLabel = (taxonomyObj:Taxonomy[], value:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === value && value !== 'all') return ` with ${t(group.label)} gender marker `;
    return groupingText;
  }, '');

  const getTextLabel = (taxonomyObj:Taxonomy[], value:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === value) return t(group.label);
    if (group.options) {
      const validOption = group.options.find((o) => o.value === value);
      if (validOption) {
        return `${t(validOption.label)}`;
      }
    }
    return groupingText;
  }, '');

  const getCountryTextLabel = (taxonomyObj:Taxonomy[], value:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === value) return t(group.label);
    if (group.options) {
      const validOption = group.options.find((o) => o.value === value);
      if (validOption) {
        return `${t(validOption.label)}`;
      }
    }
    return value === 'all' ? groupingText : t(value);
  }, '');

  const getCategoryLabel = (taxonomyObj:OutputsTaxonomy[], category:string, subcategory:string) => taxonomyObj.reduce((groupingText, group) => {
    if (group.value === category && category !== 'all') {
      const validOption = group.subcategories.find((o) => o.value === subcategory);
      if (validOption && subcategory !== 'all') return `${t(group.value)}, ${t(validOption.label)}`;
      return `${t(group.value)}`;
    }
    return groupingText;
  }, 'all output types');

  const countryGroupings = getCountryTextLabel(countryGroupingsTaxonomy, selectedRegions);
  const fundingSources = getTextLabel(fundingTaxonomy, selectedFunding);
  const taxonomy = getGenderLabel(genderMarkers, selectedGenderMarker);
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
        {' '}
        target the following benefits:
      </p>
    </div>
  );
};
