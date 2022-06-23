import { createContext } from 'react';
import { CtxDataType } from '../Types';

const Context = createContext<CtxDataType>({
  selectedRegions: '',
  selectedCountries: '',
  selectedProjects: '',
  xAxisIndicator: '',
  showProjectLocations: false,
  selectedProjectType: 'All',
  updateSelectedRegions: (_d: string) => {},
  updateSelectedCountries: (_d: string) => {},
  updateSelectedProjects: (_d: string) => {},
  updateXAxisIndicator: (_d: string) => {},
  updateShowProjectLocations: (_d: boolean) => {},
  updateSelectedProjectType: (_d: string) => {},
});

export default Context;
