import { createContext } from 'react';
import { CtxDataType } from '../Types';

const Context = createContext<CtxDataType>({
  selectedRegions: '',
  selectedFunding: 'all',
  selectedGenderMarker: 'all',
  selectedCountries: '',
  selectedProjects: '',
  xAxisIndicator: '',
  selectedTaxonomy: 'All',
  selectedCategory: 'all',
  selectedSubCategory: 'all',
  updateSelectedRegions: (_d: string) => {},
  updateSelectedGenderMarker: (_d: string) => {},
  updateSelectedFunding: (_d: string) => {},
  updateSelectedCountries: (_d: string) => {},
  updateSelectedProjects: (_d: string) => {},
  updateXAxisIndicator: (_d: string) => {},
  updateSelectedTaxonomy: (_d: string) => {},
  updateSelectedCategory: (_d: string) => {},
  updateSelectedSubCategory: (_d: string) => {},
});

export default Context;
