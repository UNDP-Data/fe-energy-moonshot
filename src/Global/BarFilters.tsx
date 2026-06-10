import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  CountryMetadataRow,
  CtxDataType,
  getAssetPath,
  IndicatorMetaDataType,
  ProjectLevelDataType,
} from '../Types';
import StackedChart from '../Components/StackedChart';
import Context from '../Context/Context';
import {
  countryGroupingsTaxonomy,
  genderMarkers,
  fundingTaxonomy,
} from '../Constants';
import {
  getProjectDirectBeneficiariesForFilters,
  outputMatchesFilters,
} from '../utils/dashboardFilters';

interface Props {
  data: ProjectLevelDataType[];
  countryList: string[];
  countryMetadataByCode: Record<string, CountryMetadataRow>;
  indicators: IndicatorMetaDataType[];
}

const BarFiltersWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  min-height: 100%;
  padding: 0.35rem 0.5rem 0.6rem 0;
  width: 100%;
  .bar-filters-content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
    width: 100%;
  }
  .bar-filter-block {
    width: 100%;
  }
  .bar-filter-block + .bar-filter-block {
    margin-top: clamp(0.45rem, 1.6vh, 0.95rem);
  }
  .undp-stacked-chart {
    margin-bottom: clamp(0.42rem, 1.2vh, 0.72rem);
  }
  .select-wrapper + .undp-stacked-chart {
    margin-top: 0;
  }
  .select-wrapper + .undp-stacked-chart .undp-stacked-chart-label {
    padding-top: 0.22rem;
  }
  .undp-stacked-chart-label {
    font-size: 0.875rem;
    padding: clamp(0.32rem, 0.9vh, 0.48rem) 0;
  }
  .undp-stacked-chart-value {
    font-size: 0.875rem;
    line-height: 1.1;
    margin-top: clamp(0.12rem, 0.5vh, 0.22rem);
  }
  @media (max-width: 960px) {
    height: auto;
    min-height: 0;
    .bar-filters-content {
      display: block;
      min-height: 0;
    }
    .bar-filter-block + .bar-filter-block {
      margin-top: 0.74rem;
    }
    .undp-stacked-chart {
      margin-bottom: 0.58rem;
    }
    .undp-stacked-chart-label {
      padding: 0.38rem 0;
    }
    .undp-stacked-chart-value {
      margin-top: 0.18rem;
    }
  }
`;

const CompactSelectWrapper = styled.div`
  &.select-wrapper {
    margin-bottom: 0.14rem;
  }
  .undp-select {
    border: 0 !important;
    box-shadow: none !important;
    cursor: pointer;
    height: 1.86rem !important;
    width: 100%;
  }
  .undp-select.ant-select,
  .undp-select.ant-select-single,
  .undp-select.ant-select-outlined {
    border: 0 !important;
    box-shadow: none !important;
  }
  .undp-select .ant-select-selector {
    background: transparent !important;
    border: 0 !important;
    border-bottom: 1px solid var(--gray-500) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    height: 1.86rem !important;
    min-height: 1.86rem !important;
    overflow: visible !important;
    padding: 0 1.5rem 0 0 !important;
    cursor: pointer !important;
  }
  .undp-select:hover .ant-select-selector,
  .undp-select.ant-select-focused .ant-select-selector,
  .undp-select.ant-select-open .ant-select-selector {
    border: 0 !important;
    border-bottom: 1px solid var(--black) !important;
    box-shadow: none !important;
  }
  .undp-select .ant-select-selection-item,
  .undp-select .ant-select-selection-placeholder {
    align-items: center;
    color: var(--black);
    display: flex;
    font-size: 0.875rem;
    font-weight: 700;
    height: 1.86rem !important;
    line-height: 1.86rem !important;
    max-width: calc(100% - 1.75rem);
    padding: 0 !important;
    cursor: pointer !important;
    text-transform: capitalize;
  }
  .undp-select .ant-select-selection-search-input {
    height: 1.86rem !important;
    line-height: 1.86rem !important;
    cursor: pointer !important;
    text-transform: none;
  }
  .undp-select-title-muted .ant-select-selection-item,
  .undp-select-title-muted .ant-select-selection-placeholder {
    color: var(--gray-600);
    font-weight: 400;
  }
  .undp-select .ant-select-selection-placeholder {
    color: var(--gray-600);
  }
  .undp-select .ant-select-selection-search {
    bottom: 0 !important;
    inset-inline-start: 0 !important;
    inset-inline-end: 1.5rem !important;
    top: 0 !important;
  }
  .undp-select .ant-select-arrow {
    align-items: center;
    color: var(--black);
    display: flex;
    height: 1.86rem !important;
    inset-inline-end: 0 !important;
    margin-top: 0 !important;
    top: 0 !important;
    transform: none !important;
    cursor: pointer;
  }
  .undp-select .ant-select-arrow .anticon,
  .undp-select .ant-select-arrow svg {
    display: block;
    line-height: 1;
  }
`;

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

const formatDropdownOptionLabel = (label: string) => {
  if (!label.toLowerCase().startsWith('all ')) return label;
  return label.replace(/\b[a-z]/g, (character) => character.toUpperCase());
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
    resetDashboardFilters,
    xAxisIndicator,
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

  const {
    countryList,
    data,
    countryMetadataByCode,
    indicators,
  } = props;

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
      .catch(() => {
        setTooltips({});
      });
  }, []);

  const selectedIndicator = useMemo(
    () => indicators.find((indicator) => indicator.Indicator === xAxisIndicator) || indicators[0],
    [indicators, xAxisIndicator],
  );

  const getProjectIndicatorValue = useCallback((item: ProjectLevelDataType) => {
    if (!selectedIndicator) return 0;

    const indicatorName = selectedIndicator.DataKey;

    if (indicatorName === 'nProj') return 1;

    if (selectedIndicator.AggregationLevel === 'outputs') {
      return (item.outputs || []).reduce((sum, output) => (
        outputMatchesFilters(output, filters)
          ? sum + Number(output[indicatorName] || 0)
          : sum
      ), 0);
    }

    if (indicatorName === 'directBeneficiaries') {
      return getProjectDirectBeneficiariesForFilters(item, filters);
    }

    return Number(item[indicatorName as keyof ProjectLevelDataType] || 0);
  }, [filters, selectedIndicator]);

  const getChartSegmentKey = (chartData: Record<string, any>, label: string) => {
    const entry = Object.entries(chartData).find(([segmentLabel]) => segmentLabel === label);
    return entry ? entry[1].key || label : label;
  };

  const computeHdiBarData = useCallback(() => {
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
        acc[item.hdiTier].value += getProjectIndicatorValue(item);
      }
      return acc;
    }, taxonomy);
  }, [data, getProjectIndicatorValue]);

  const computeRegionBarData = useCallback(() => {
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
        acc[t(`${item.region}code`) as string].value += getProjectIndicatorValue(item);
      }
      return acc;
    }, taxonomy);
  }, [data, getProjectIndicatorValue, t]);

  const computeGroupingsBarData = useCallback(() => {
    const order: { [key: string]: number } = {
      LDC: 2,
      LLDC: 3,
      SIDS: 1,
      OTHER: 4,
    };

    const taxonomy = [
      ...(countryGroupingsTaxonomy[4]?.options ?? []),
      {
        label: 'other-grouping',
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
      const selectedIndicatorValue = getProjectIndicatorValue(item);

      (item.specialGroupings || []).forEach((grouping) => {
        const normalizedGrouping = grouping === 'LLDCs' ? 'LLDC' : grouping;
        if (acc[normalizedGrouping]) {
          acc[normalizedGrouping].value += selectedIndicatorValue;
        }

        if ((item.specialGroupings || []).length > 1) {
          if ((item.specialGroupings || []).includes('SIDS') && acc.LDC) {
            acc.LDC.overlap += selectedIndicatorValue;
          }
          if ((item.specialGroupings || []).includes('LLDCs') && acc.LLDC) {
            acc.LLDC.overlap += selectedIndicatorValue;
          }
        }
      });

      if (!(item.specialGroupings || []).length) {
        acc.Other.value += selectedIndicatorValue;
      }

      return acc;
    }, taxonomy);
  }, [data, getProjectIndicatorValue]);

  const computeGenderBarData = useCallback(() => {
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

    taxonomy[t('no-marker')] = {
      key: 'no-marker',
      value: 0,
      color: '#DADADA',
      order: Object.keys(taxonomy).length + 1,
    };

    return data.reduce((acc, item) => {
      const selectedIndicatorValue = getProjectIndicatorValue(item);

      if (item.genderMarker && acc[item.genderMarker]) {
        acc[item.genderMarker].value += selectedIndicatorValue;
      } else if (!item.genderMarker) {
        acc[t('no-marker')].value += selectedIndicatorValue;
      }

      return acc;
    }, taxonomy);
  }, [data, getProjectIndicatorValue, t]);

  const computeFundingBarData = useCallback(() => {
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
      const selectedIndicatorValue = getProjectIndicatorValue(item);
      if (item.verticalFunded) {
        acc[t(fundingTaxonomy[1].label)].value += selectedIndicatorValue;
      } else {
        acc[t(fundingTaxonomy[2].label)].value += selectedIndicatorValue;
      }
      return acc;
    }, taxonomy);
  }, [data, getProjectIndicatorValue, t]);

  const hdiBarData = useMemo(() => computeHdiBarData(), [computeHdiBarData]);
  const regionBarData = useMemo(() => computeRegionBarData(), [computeRegionBarData]);
  const groupingsBarData = useMemo(() => computeGroupingsBarData(), [computeGroupingsBarData]);
  const genderBarData = useMemo(() => computeGenderBarData(), [computeGenderBarData]);
  const fundingBarData = useMemo(() => computeFundingBarData(), [computeFundingBarData]);

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

  const updateSelectOpenState = (index: number, open: boolean) => {
    setIsSelectOpen((current) => current.map((value, itemIndex) => (
      itemIndex === index ? open : value
    )));
  };

  const getSelectClassName = (_index: number) => 'undp-select';

  return (
    <BarFiltersWrapper>
      <div className='bar-filters-content'>
        <div className='bar-filter-block'>
          <CompactSelectWrapper className='select-wrapper'>
            <Select
              bordered={false}
              onDropdownVisibleChange={(open) => {
                updateSelectOpenState(0, open);
              }}
              showSearch
              filterOption={(input, option) => (
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input?.toLowerCase())
              )}
              className={getSelectClassName(0)}
              optionLabelProp='label'
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
                  {formatDropdownOptionLabel(t(item.label))}
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
          </CompactSelectWrapper>
          <StackedChart
            id='finance-bar-chart'
            data={fundingBarData}
            clickCallback={fundingUpdateCallback}
            tooltips={tooltips}
          />
        </div>

        <div className='bar-filter-block'>
          <CompactSelectWrapper className='select-wrapper'>
            <Select
              bordered={false}
              onDropdownVisibleChange={(open) => {
                updateSelectOpenState(1, open);
              }}
              showSearch
              className={getSelectClassName(1)}
              optionLabelProp='label'
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
                          {formatDropdownOptionLabel(item.key === 'countries' ? option.label : t(option.label))}
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
                    {formatDropdownOptionLabel(t(item.label))}
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
          </CompactSelectWrapper>
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

        <div className='bar-filter-block'>
          <CompactSelectWrapper className='select-wrapper'>
            <Select
              bordered={false}
              onDropdownVisibleChange={(open) => {
                updateSelectOpenState(2, open);
              }}
              showSearch
              className={getSelectClassName(2)}
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
                label={t('no-marker')}
                key='no-marker'
              >
                {t('no-marker')}
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
          </CompactSelectWrapper>
          <StackedChart
            id='gender-bar-chart'
            data={genderBarData}
            clickCallback={genderUpdateCallback}
            tooltips={tooltips}
          />
        </div>
        <Button
          style={{ marginTop: '0.5rem', width: '100%' }}
          onClick={resetDashboardFilters}
        >
          {t('clear-filters')}
        </Button>
      </div>
    </BarFiltersWrapper>
  );
};
