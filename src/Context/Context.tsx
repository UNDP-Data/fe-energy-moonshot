import { createContext } from 'react';
import { CtxDataType } from '../Types';

const Context = createContext<CtxDataType>({
  selectedRegions: '',
  selectedCountries: '',
  xAxisIndicator: '',
  showProjectLocations: false,
  updateSelectedRegions: (_d: string) => {},
  updateSelectedCountries: (_d: string) => {},
  updateXAxisIndicator: (_d: string) => {},
  updateShowProjectLocations: (_d: boolean) => {},
});

export default Context;
