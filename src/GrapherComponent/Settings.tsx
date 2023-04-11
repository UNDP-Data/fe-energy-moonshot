import { useContext } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType, RegionDataType } from '../Types';
import Context from '../Context/Context';

interface Props {
  regions: RegionDataType[];
}

export const Settings = (props: Props) => {
  const {
    regions,
  } = props;
  const {
    selectedRegions,
    selectedTaxonomy,
    updateSelectedRegions,
    updateSelectedTaxonomy,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');
  // translation
  const { t } = useTranslation();
  const TaxonomyList = [
    {
      value: 'All',
      label: t('all-categories'),
    },
    {
      value: 'Cross-cutting',
      label: t('cross-cutting'),
    },
    {
      value: 'Energy Access',
      label: t('energy-access'),
    },
    {
      value: 'Energy Transition',
      label: 'Energy Transition',
    },
  ];
  return (
    <div className='flex-div flex-space-between margin-bottom-07'>
      <div style={{ width: `${!queryRegion ? 'calc(50% - 0.5rem)' : '100%'}` }}>
        <p className='label'>{ t('select-taxonomy')}</p>
        <Select
          className='undp-select'
          placeholder='Select a project taxonomy'
          value={selectedTaxonomy}
          onChange={(d: string) => { updateSelectedTaxonomy(d === undefined ? 'All' : d); }}
        >
          {
            TaxonomyList.map((d) => (
              <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
            ))
          }
        </Select>
      </div>
      {
        !queryRegion
          ? (
            <div style={{ width: 'calc(50% - 0.5rem)' }}>
              <p className='label'>{t('select-bureau')}</p>
              <Select
                className='undp-select'
                placeholder='Select a region'
                value={selectedRegions}
                onChange={(d: string) => { updateSelectedRegions(d === undefined ? 'All' : d); }}
              >
                <Select.Option className='undp-select-option' key='All'>{t('all-regions')}</Select.Option>
                {
                  regions.map((d) => (
                    <Select.Option className='undp-select-option' key={d.value}>{d.label}</Select.Option>
                  ))
                }
              </Select>
            </div>
          ) : null
      }
    </div>
  );
};
