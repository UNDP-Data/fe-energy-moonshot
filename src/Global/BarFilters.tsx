/* tslint:disable */
/* eslint-disable */
import { useContext, useEffect, useMemo, useState } from 'react';
import { Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  CountryMetadataRow,
  CtxDataType,
  getAssetPath,
  ProjectLevelDataType,
} from '../Types';
import StackedChart from '../Components/StackedChart';
import Context from '../Context/Context';
import {
  countryGroupingsTaxonomy,
  genderMarkers,
  fundingTaxonomy,
} from '../Constants';
import { getProjectDirectBeneficiariesForFilters } from '../utils/dashboardFilters';

interface Props {
  data: ProjectLevelDataType[];
  countryList: string[];
  countryMetadataByCode: Record<string, CountryMetadataRow>;
}

const EMPTY_VISIBLE_GEO_FILTERS = {
  bureau: 'all',
  economy: 'all',
  hdiTier: 'all',
  specialGrouping: 'all',
  countryCode: 'all',
};

const normalizeFundingValue = (value: string) => {
  if (value === 'nonvf') return 'non-vf';
  return value;
};

const getSelectedRegionValue = (filters: any) => {
  if (filters.countryCode !== 'all') return filters.countryCode;
  if (filters.bureau !== 'all') return filters.bureau;
  if (filters.specialGrouping !== 'all') return filters.specialGrouping;
  if (filters.hdiTier !== 'all') return filters.hdiTier;
  if (filters.economy !== 'all') return filters.economy;
  return 'all';
};

export const BarFilters = (props: Props) => {
  const {
    filters,
    updateDashboardFilter,
    applyDashboardFilters,
  } = useContext(Context) as CtxDataType;
  const selectedFunding = normalizeFundingValue(filters.funding);
  const selectedGenderMarker = filters.genderMarker;
  const selectedRegions = getSelectedRegionValue(filters);
  const { t } = useTranslation();
  const [tooltips, setTooltips] = useState({});
  const [showSelectTooltip, setShowSelectTooltip] = useState([
    false,
    false,
    false,
  ]);
  const [isSelectOpen, setIsSelectOpen] = useState([false, false, false]);

  const { countryList, data, countryMetadataByCode } = props;

  useEffect(() => {
    fetch(getAssetPath('/data/moonshot-toolips.json'))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setTooltips(responseData);
      })
      .catch((error) => {
        console.error('Error fetching JSON:', error);
      });
  }, []);

  const getProjectBeneficiaries = (item: ProjectLevelDataType) => (
    getProjectDirectBeneficiariesForFilters(item, filters)
  );

  const getChartSegmentKey = (chartData: Record<string, any>, label: string) => {
    const entry = Object.entries(chartData).find(([segmentLabel]) => segmentLabel === label);
    return entry ? entry[1].key || label : label;
  };

  const computeHdiBarData = () => {
    const taxonomy = (countryGroupingsTaxonomy[3]?.options ?? [])
      .filter((taxonomyItem) => taxonomyItem?.value !== 'all')
      .reduce((acc: any, item: any) => {
        acc[item.value] = {
          key: item.value,
          value: 0,
          color: item.color,
          order:
            (countryGroupingsTaxonomy[3]?.options ?? []).length
            - Object.keys(acc).length,
        };
        return acc;
      }, {});

    return data.reduce((acc, item) => {
      if (item.hdiTier && acc[item.hdiTier]) {
        acc[item.hdiTier].value += getProjectBeneficiaries(item);
      }
      return acc;
    }, taxonomy);
  };

  const computeRegionBarData = () => {
    const taxonomy = (countryGroupingsTaxonomy[1]?.options ?? [])
      .filter((taxonomyItem) => taxonomyItem?.value !== 'all')
      .reduce((acc: any, item: any) => {
        acc[t(`${item.label}code`) as string] = {
          key: item.value,
          value: 0,
          color: item.color,
          order:
            (countryGroupingsTaxonomy[1]?.options ?? []).length
            - Object.keys(acc).length,
        };
        return acc;
      }, {});

    return data.reduce((acc, item) => {
      if (item.region && acc[t(`${item.region}code`) as string]) {
        acc[t(`${item.region}code`) as string].value += getProjectBeneficiaries(item);
      }
      return acc;
    }, taxonomy);
  };

  const computeGroupingsBarData = () => {
    const order: { [key: string]: number } = {
      LDC: 2,
      LLDC: 3,
      SIDS: 1,
      OTHER: 4,
    };

    const taxonomy = [
      ...(countryGroupingsTaxonomy[4]?.options ?? []),
      {
        label: 'Other',
        value: 'Other',
        color: '#DADADA',
      },
    ]
      .filter((taxonomyItem) => taxonomyItem?.value !== 'all')
      .reduce((acc: any, item: any) => {
        acc[item.value as string] = {
          key: item.value,
          value: 0,
          color: item.color,
          overlap: 0,
          order: order[item.value.toUpperCase()] ?? 0,
        };
        return acc;
      }, {});

    return data.reduce((acc, item) => {
      const totalDirectBeneficiaries = getProjectBeneficiaries(item);

      (item.specialGroupings || []).forEach((grouping) => {
        const normalizedGrouping = grouping === 'LLDCs' ? 'LLDC' : grouping;
        if (acc[normalizedGrouping]) {
          acc[normalizedGrouping].value += totalDirectBeneficiaries;
        }

        if ((item.specialGroupings || []).length > 1) {
          if ((item.specialGroupings || []).includes('SIDS') && acc.LDC) {
            acc.LDC.overlap += totalDirectBeneficiaries;
          }
          if ((item.specialGroupings || []).includes('LLDCs') && acc.LLDC) {
            acc.LLDC.overlap += totalDirectBeneficiaries;
          }
        }
      });

      if (!(item.specialGroupings || []).length) {
        acc.Other.value += totalDirectBeneficiaries;
      }

      return acc;
    }, taxonomy);
  };

  const computeGenderBarData = () => {
    const taxonomy = genderMarkers
      .filter((taxonomyItem) => taxonomyItem.value !== 'all')
      .reduce((acc: any, item: any) => {
        acc[item.label] = {
          key: item.value,
          value: 0,
          color: item.color,
          order: Object.keys(acc).length + 1,
        };
        return acc;
      }, {});

    taxonomy['No marker'] = {
      key: 'no-marker',
      value: 0,
      color: '#DADADA',
      order: Object.keys(taxonomy).length + 1,
    };

    return data.reduce((acc, item) => {
      const totalDirectBeneficiaries = getProjectBeneficiaries(item);

      if (item.genderMarker && acc[item.genderMarker]) {
        acc[item.genderMarker].value += totalDirectBeneficiaries;
      } else if (!item.genderMarker) {
        acc['No marker'].value += totalDirectBeneficiaries;
      }

      return acc;
    }, taxonomy);
  };

  const computeFundingBarData = () => {
    const taxonomy = fundingTaxonomy
      .filter((taxonomyItem) => taxonomyItem.value !== 'all')
      .reduce((acc: any, item: any) => {
        const key = item.value === 'nonvf' ? 'non-vf' : item.value;
        acc[t(item.label) as string] = {
          key,
          value: 0,
          color: item.color,
          order: Object.keys(acc).length + 1,
        };
        return acc;
      }, {});

    return data.reduce((acc, item) => {
      const totalDirectBeneficiaries = getProjectBeneficiaries(item);
      if (item.verticalFunded) {
        acc[t(fundingTaxonomy[1].label)].value += totalDirectBeneficiaries;
      } else {
        acc[t(fundingTaxonomy[2].label)].value += totalDirectBeneficiaries;
      }
      return acc;
    }, taxonomy);
  };

  const [hdiBarData, setHdiBarData] = useState(() => computeHdiBarData());
  const [regionBarData, setRegionBarData] = useState(() => computeRegionBarData());
  const [groupingsBarData, setGroupingsBarData] = useState(() => computeGroupingsBarData());
  const [genderBarData, setGenderBarData] = useState(() => computeGenderBarData());
  const [fundingBarData, setFundingBarData] = useState(() => computeFundingBarData());

  useEffect(() => {
    setHdiBarData(computeHdiBarData());
    setRegionBarData(computeRegionBarData());
    setGroupingsBarData(computeGroupingsBarData());
    setGenderBarData(computeGenderBarData());
    setFundingBarData(computeFundingBarData());
  }, [data, t]);

  const regionOptions = useMemo(() => {
    const merged = [...countryGroupingsTaxonomy];
    merged.push({
      label: 'countries',
      key: 'countries',
      options: countryList.map((countryCode) => ({
        label: countryMetadataByCode[countryCode]?.['Country Name'] || countryCode,
        value: countryCode,
      })),
    } as any);
    return merged;
  }, [countryList, countryMetadataByCode]);

  const updateRegionSelection = (newState: string) => {
    const nextFilters: any = { ...EMPTY_VISIBLE_GEO_FILTERS };
    if (newState !== 'all') {
      if (countryList.includes(newState)) {
        nextFilters.countryCode = newState;
      } else if ((countryGroupingsTaxonomy[1]?.options ?? []).some((option) => option.value === newState)) {
        nextFilters.bureau = newState;
      } else if ((countryGroupingsTaxonomy[3]?.options ?? []).some((option) => option.value === newState)) {
        nextFilters.hdiTier = newState;
      } else if ((countryGroupingsTaxonomy[4]?.options ?? []).some((option) => option.value === newState)) {
        nextFilters.specialGrouping = newState;
      } else if (newState === 'Other') {
        nextFilters.specialGrouping = 'Other';
      } else {
        nextFilters.economy = newState;
      }
    }
    applyDashboardFilters(nextFilters);
  };

  const regionUpdateCallback = (newState: any) => {
    updateRegionSelection(newState === selectedRegions ? 'all' : newState);
  };

  const genderUpdateCallback = (newState: any) => {
    const nextValue = getChartSegmentKey(genderBarData, newState);
    updateDashboardFilter(
      'genderMarker',
      nextValue === selectedGenderMarker ? 'all' : nextValue,
    );
  };

  const fundingUpdateCallback = (newState: any) => {
    const nextValue = normalizeFundingValue(getChartSegmentKey(fundingBarData, newState));
    updateDashboardFilter(
      'funding',
      nextValue === selectedFunding ? 'all' : nextValue,
    );
  };

  return (
    <div>
      <div className='margin-bottom-07'>
        <div style={{ width: '100%' }}>
          <div className='select-wrapper margin-bottom-04'>
            <Select
              onDropdownVisibleChange={(open) => {
                setIsSelectOpen([open, isSelectOpen[1], isSelectOpen[2]]);
              }}
              showSearch
              filterOption={(input, option) => (
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input?.toLowerCase())
              )}
              className='undp-select'
              placeholder={t('select-funding')}
              value={selectedFunding}
              onChange={(value: string) => {
                updateDashboardFilter('funding', value === undefined ? 'all' : normalizeFundingValue(value));
              }}
              onMouseEnter={() => {
                setShowSelectTooltip([true, false, false]);
              }}
              onMouseLeave={() => {
                setShowSelectTooltip([false, false, false]);
              }}
            >
              {fundingTaxonomy.map((item) => (
                <Select.Option
                  className='undp-select-option'
                  label={t(item.label)}
                  key={item.value === 'nonvf' ? 'non-vf' : item.value}
                >
                  {t(item.label)}
                </Select.Option>
              ))}
            </Select>
            <p
              dangerouslySetInnerHTML={{ __html: t('funding-tooltip') || '' }}
              className='select-tooltip'
              style={{
                opacity: showSelectTooltip[0] && !isSelectOpen[0] ? 1 : 0,
              }}
            />
          </div>
          <StackedChart
            id='finance-bar-chart'
            data={fundingBarData}
            clickCallback={fundingUpdateCallback}
            tooltips={tooltips}
          />
        </div>

        <div style={{ width: '100%' }}>
          <div className='select-wrapper margin-bottom-04'>
            <Select
              onDropdownVisibleChange={(open) => {
                setIsSelectOpen([isSelectOpen[0], open, isSelectOpen[2]]);
              }}
              showSearch
              className='undp-select'
              filterOption={(input, option) => (
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input?.toLowerCase())
              )}
              placeholder={t('select-country-group')}
              value={selectedRegions}
              onChange={(value: string) => {
                updateRegionSelection(value === undefined ? 'all' : value);
              }}
              onMouseEnter={() => {
                setShowSelectTooltip([false, true, false]);
              }}
              onMouseLeave={() => {
                setShowSelectTooltip([false, false, false]);
              }}
            >
              {regionOptions.map((item: any) => {
                if (item.options) {
                  return (
                    <Select.OptGroup key={item.key} label={t(item.label)}>
                      {item.options.map((option: any) => (
                        <Select.Option
                          className='undp-select-option'
                          label={item.key === 'countries' ? option.label : t(option.label)}
                          key={option.value}
                        >
                          {item.key === 'countries' ? option.label : t(option.label)}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  );
                }

                return (
                  <Select.Option
                    className='undp-select-option'
                    label={t(item.label)}
                    key={item.value}
                  >
                    {t(item.label)}
                  </Select.Option>
                );
              })}
            </Select>
            <p
              dangerouslySetInnerHTML={{
                __html: t('country-group-tooltip') || '',
              }}
              className='select-tooltip'
              style={{
                opacity: showSelectTooltip[1] && !isSelectOpen[1] ? 1 : 0,
              }}
            />
          </div>
          <StackedChart
            id='region-bar-chart'
            data={regionBarData}
            clickCallback={regionUpdateCallback}
            tooltips={tooltips}
            useKey
          />
          <StackedChart
            id='groupings-bar-chart'
            data={groupingsBarData}
            clickCallback={regionUpdateCallback}
            tooltips={tooltips}
          />
          <StackedChart
            id='hdi-bar-chart'
            data={hdiBarData}
            clickCallback={regionUpdateCallback}
            tooltips={tooltips}
          />
        </div>

        <div style={{ width: '100%' }}>
          <div className='select-wrapper margin-bottom-04'>
            <Select
              onDropdownVisibleChange={(open) => {
                setIsSelectOpen([isSelectOpen[0], isSelectOpen[1], open]);
              }}
              showSearch
              className='undp-select'
              filterOption={(input, option) => (
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input?.toLowerCase())
              )}
              placeholder={t('select-taxonomy')}
              value={selectedGenderMarker}
              onChange={(value: string) => {
                updateDashboardFilter('genderMarker', value === undefined ? 'all' : value);
              }}
              onMouseEnter={() => {
                setShowSelectTooltip([false, false, true]);
              }}
              onMouseLeave={() => {
                setShowSelectTooltip([false, false, false]);
              }}
            >
              {genderMarkers.map((item) => (
                <Select.Option
                  className='undp-select-option'
                  label={t(item.label)}
                  key={item.value}
                >
                  {item.tooltip ? (
                    <Tooltip title={t(item.tooltip)}>{t(item.label)}</Tooltip>
                  ) : (
                    t(item.label)
                  )}
                </Select.Option>
              ))}
              <Select.Option
                className='undp-select-option'
                label='No marker'
                key='no-marker'
              >
                No marker
              </Select.Option>
            </Select>
            <p
              dangerouslySetInnerHTML={{
                __html: t('gender-marker-tooltip') || '',
              }}
              className='select-tooltip'
              style={{
                opacity: showSelectTooltip[2] && !isSelectOpen[2] ? 1 : 0,
              }}
            />
          </div>
          <StackedChart
            id='gender-bar-chart'
            data={genderBarData}
            clickCallback={genderUpdateCallback}
            tooltips={tooltips}
          />
        </div>
      </div>
    </div>
  );
};
