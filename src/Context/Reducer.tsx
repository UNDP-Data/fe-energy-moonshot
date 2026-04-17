export default (state: any, action: any) => {
  switch (action.type) {
    case 'UPDATE_DASHBOARD_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'APPLY_DASHBOARD_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case 'RESET_DASHBOARD_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };
    case 'UPDATE_X_AXIS_INDICATOR':
      return { ...state, xAxisIndicator: action.payload };
    default:
      return { ...state };
  }
};
