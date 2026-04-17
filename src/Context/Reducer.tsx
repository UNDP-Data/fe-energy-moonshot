const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'UPDATE_DASHBOARD_FILTER': {
      if (state.filters[action.payload.key] === action.payload.value) {
        return state;
      }
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    }
    case 'APPLY_DASHBOARD_FILTERS': {
      const nextFilters = {
        ...state.filters,
        ...action.payload,
      };

      const filtersChanged = Object.keys(nextFilters).some(
        (key) => nextFilters[key] !== state.filters[key],
      );

      if (!filtersChanged) {
        return state;
      }

      return {
        ...state,
        filters: nextFilters,
      };
    }
    case 'RESET_DASHBOARD_FILTERS': {
      const filtersChanged = Object.keys(action.payload).some(
        (key) => action.payload[key] !== state.filters[key],
      );

      if (!filtersChanged) {
        return state;
      }

      return {
        ...state,
        filters: action.payload,
      };
    }
    case 'UPDATE_X_AXIS_INDICATOR':
      if (state.xAxisIndicator === action.payload) {
        return state;
      }
      return { ...state, xAxisIndicator: action.payload };
    default:
      return state;
  }
};

export default reducer;
