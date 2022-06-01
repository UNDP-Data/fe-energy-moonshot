import { createContext } from 'react';
import { CtxDataType } from '../Types';

const Context = createContext<CtxDataType>({
  selectedRegions: '',
  selectedCountries: '',
  xAxisIndicator: '',
  updateSelectedRegions: (_d: string) => {},
  updateSelectedCountries: (_d: string) => {},
  updateXAxisIndicator: (_d: string) => {},
});

export default Context;
