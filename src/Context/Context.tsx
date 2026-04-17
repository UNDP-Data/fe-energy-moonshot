import { createContext } from 'react';
import { CtxDataType } from '../Types';

const Context = createContext<CtxDataType>({
  filters: {
    funding: 'all',
    genderMarker: 'all',
    category: 'all',
    subCategory: 'all',
    bureau: 'all',
    economy: 'all',
    hdiTier: 'all',
    specialGrouping: 'all',
    continentRegion: 'all',
    subRegion: 'all',
    sahel: 'all',
    crisis: 'all',
    countryCode: 'all',
  },
  xAxisIndicator: '',
  updateDashboardFilter: (_key, _value) => {},
  applyDashboardFilters: (_filters) => {},
  resetDashboardFilters: () => {},
  updateXAxisIndicator: (_d: string) => {},
});

export default Context;
