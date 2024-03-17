import { useContext, useEffect, useState } from 'react';
import { Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { CtxDataType, ProjectLevelDataType } from '../Types';
import StackedChart from '../Components/StackedChart';
import Context from '../Context/Context';
import {
  outputsTaxonomy, countryGroupingsTaxonomy, genderMarkers, fundingTaxonomy,
} from '../Constants';

interface Props {
  data: ProjectLevelDataType[];
  countryList: string[];
}

export const BarFilters = (props: Props) => {
  const {
    selectedRegions,
    selectedFunding,
    selectedGenderMarker,
    updateSelectedRegions,
    updateSelectedFunding,
    updateSelectedGenderMarker,
  } = useContext(Context) as CtxDataType;
  // translation
  const { t } = useTranslation();

  const { countryList, data } = props;

  const computeHdiBarData = function () {
    const taxonomy = countryGroupingsTaxonomy[3]?.options.filter((ti) => ti?.value !== 'all').reduce((acc, item) => {
      acc[t(item.label) as string] = {
        key: item.value,
        value: 0,
        color: item.color,
        order: countryGroupingsTaxonomy[3]?.options.length - Object.keys(acc).length,
      };
      return acc;
    }, {});
    return data.reduce((acc, item) => {
      if (item.hdiTier && acc[item.hdiTier]) {
        acc[item.hdiTier].value += item.budget;
      }
      return acc;
    }, taxonomy);
  }

  const [hdiBarData, setHdiBarData] = useState(() => {
    return computeHdiBarData()
  });

  useEffect(() => {
    setHdiBarData(computeHdiBarData())
  }, [data])

  const [regionBarData, setRegionBarData] = useState(() => {
    const taxonomy = countryGroupingsTaxonomy[1]?.options.filter((ti) => ti?.value !== 'all').reduce((acc, item) => {
      acc[t(`${item.label}code`) as string] = {
        key: item.value,
        value: 0,
        color: item.color,
        order: countryGroupingsTaxonomy[1]?.options.length - Object.keys(acc).length,
      };
      return acc;
    }, {});
    return data.reduce((acc, item) => {
      if (item.region && acc[t(`${item.region}code`)]) {
        acc[t(`${item.region}code`) as string].value += item.budget;
      }
      return acc;
    }, taxonomy);
  });

  const [groupingsBarData, setGroupingsBarData] = useState(() => {
    const taxonomy = [...countryGroupingsTaxonomy[4]?.options, {
      label: 'Other',
      value: 'Other',
      color: '#DADADA',
    }].filter((ti) => ti?.value !== 'all').reduce((acc, item) => {
      acc[item.value as string] = {
        key: item.value,
        value: 0,
        color: item.color,
        overlap:0,
        order: countryGroupingsTaxonomy[4]?.options.length - Object.keys(acc).length,
      };
      return acc;
    }, {});
    return data.reduce((acc, item) => {
      item.specialGroupings.map((sg) => {
        acc[sg as string].value += item.budget;
        if(item.specialGroupings.length > 1) {
          if(item.specialGroupings && item.specialGroupings.includes('SIDS')) {
            acc['LDC'].overlap += item.budget;
          }
          if(item.specialGroupings && item.specialGroupings.includes('LLDCs')) {
            acc['LLDC'].overlap += item.budget;
          }
        }
      })
      if(item.specialGroupings.length === 0 || !item.specialGroupings) {
        acc['Other'].value += item.budget;
      }
      return acc;
    }, taxonomy);
  });

  const regionUpdateCallback = function(newState) {
    updateSelectedRegions(newState);
  }

  const [genderBarData, setGenderBarData] = useState(() => {
    const taxonomy = genderMarkers.filter((ti) => ti.value !== 'all').reduce((acc, item) => {
      acc[item.label] = {
        key: item.value,
        value: 0,
        color: item.color,
        order: Object.keys(acc).length + 1,
      };
      return acc;
    }, {});
    return data.reduce((acc, item) => {
      if (item.genderMarker && acc[item.genderMarker]) {
        acc[item.genderMarker].value += item.budget;
      }
      return acc;
    }, taxonomy);
  });

  const genderUpdateCallback = function(newState) {
    updateSelectedGenderMarker(newState);
  }

  const [fundingBarData, setFundingBarData] = useState(() => {
    const taxonomy = fundingTaxonomy.filter((ti) => ti.value !== 'all').reduce((acc, item) => {
      acc[t(item.label) as string] = {
        key: item.value,
        value: 0,
        color: item.color,
        order: Object.keys(acc).length + 1,
      };
      return acc;
    }, {});
    return data.reduce((acc, item) => {
      if (item.verticalFunded) {
        acc[t(fundingTaxonomy[1].label)].value += item.budget;
      } else {
        acc[t(fundingTaxonomy[2].label)].value += item.budget;
      }
      return acc;
    }, taxonomy);
  });

  const fundingUpdateCallback = function(newState) {
    updateSelectedFunding(newState);
  }

  const outputsTaxonomyTranslated = outputsTaxonomy.map((ot) => ({
    value: ot.value,
    label: t(ot.label),
    subcategories: ot.subcategories.map((ots) => ({
      value: ots.value,
      label: t(ots.label),
    })),
  }));

  const countryGroupingsMerged = [...countryGroupingsTaxonomy];
  countryGroupingsMerged.push({
    label: 'countries',
    key: 'countries',
    options: countryList.map((c) => ({
      label: c,
      value: c,
    })),
  });

  return (
    <div>
      <div className='margin-bottom-07'>
        <div style={{ width: '100%' }}>
          <Tooltip
            title={<div dangerouslySetInnerHTML={{ __html: t('funding-tooltip') || '' }} />}
            placement='top'
            overlayStyle={{
              maxWidth: '550px',
            }}
          >
            <p className='label underline'>{t('select-funding')}</p>
          </Tooltip>
          <Select
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            className='undp-select margin-bottom-04'
            placeholder={t('select-funding')}
            value={selectedFunding}
            onChange={(d: string) => { updateSelectedFunding(d === undefined ? 'all' : d); }}
          >
            {
              fundingTaxonomy.map((d) => (
                <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>{t(d.label)}</Select.Option>
              ))
            }
          </Select>
          <p className='undp-typography margin-bottom-04'>
            Select categories and filters to analyze number of beneficiaries of the
            <b>
              UNDP energy portfolio
            </b>
            from
            <b>
              2022-2025:
            </b>
          </p>
          <StackedChart
            id='finance-bar-chart'
            data={fundingBarData}
            clickCallback={fundingUpdateCallback}
          />
        </div>
        <div style={{ width: '100%' }}>
          <Tooltip
            title={<div dangerouslySetInnerHTML={{ __html: t('country-group-tooltip') || '' }} />}
            placement='top'
            overlayStyle={{
              maxWidth: '550px',
            }}
          >
            <p className='label underline'>{t('select-country-group')}</p>
          </Tooltip>
          <Select
            showSearch
            className='undp-select'
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            placeholder={t('select-country-group')}
            value={selectedRegions}
            onChange={(d: string) => { updateSelectedRegions(d === undefined ? 'all' : d); }}
          >
            {
              countryGroupingsMerged.map((d) => {
                if (d.options) {
                  return (
                    <Select.OptGroup key={d.key} label={t(d.label)}>
                      {d.options.map((o) => (
                        <Select.Option
                          className='undp-select-option'
                          label={t(o.label)}
                          key={o.value}
                        >
                          {t(o.label)}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  );
                }
                return (
                  <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>{t(d.label)}</Select.Option>
                );
              })
            }
          </Select>
          <p className='undp-typography margin-bottom-04'>
            Select categories and filters to analyze beneficiaries of the UNDP energy.
            <b>
              UNDP energy.
            </b>
          </p>
          <StackedChart
            id='hdi-bar-chart'
            data={hdiBarData}
            clickCallback={regionUpdateCallback}
          />
          <StackedChart
            id='region-bar-chart'
            data={regionBarData}
            clickCallback={regionUpdateCallback}
          />
          <StackedChart
            id='groupings-bar-chart'
            data={groupingsBarData}
            clickCallback={regionUpdateCallback}
          />
        </div>
        <div style={{ width: '100%' }}>
          <Tooltip
            title={<div dangerouslySetInnerHTML={{ __html: t('gender-marker-tooltip') || '' }} />}
            placement='top'
            overlayStyle={{
              maxWidth: '550px',
            }}
          >
            <p className='label underline'>{ t('select-gender-marker')}</p>
          </Tooltip>
          <Select
            showSearch
            className='undp-select'
            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input?.toLowerCase())}
            placeholder={t('select-taxonomy')}
            value={selectedGenderMarker}
            onChange={(d: string) => { updateSelectedGenderMarker(d === undefined ? 'all' : d); }}
          >
            {
              genderMarkers.map((d) => (
                <Select.Option className='undp-select-option' label={t(d.label)} key={d.value}>
                  { d.tooltip ? (
                    <Tooltip title={t(d.tooltip)}>
                      {t(d.label)}
                    </Tooltip>
                  ) : (
                    t(d.label)
                  )}
                </Select.Option>
              ))
            }
          </Select>
          <p className='undp-typography margin-bottom-04'>
            Text explaining gender markers here - Text explaining gender markers here - Text explaining gender markers here
          </p>
          <StackedChart
            id='gender-bar-chart'
            data={genderBarData}
            clickCallback={genderUpdateCallback}
          />
        </div>
      </div>
    </div>
  );
};
