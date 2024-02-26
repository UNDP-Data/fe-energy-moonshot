export default (state: any, action: any) => {
  switch (action.type) {
    case 'UPDATE_SELECTED_REGIONS':
      return { ...state, selectedRegions: action.payload };
    case 'UPDATE_SELECTED_FUNDING':
      return { ...state, selectedFunding: action.payload };
    case 'UPDATE_SELECTED_VARIOUS_TAXONOMY':
      return { ...state, selectedGenderMarker: action.payload };
    case 'UPDATE_SELECTED_COUNTRIES':
      return { ...state, selectedCountries: action.payload };
    case 'UPDATE_SELECTED_PROJECTS':
      return { ...state, selectedProjects: action.payload };
    case 'UPDATE_X_AXIS_INDICATOR':
      return { ...state, xAxisIndicator: action.payload };
    case 'UPDATE_SELECTED_PROJECT_TYPE':
      return { ...state, selectedProjectType: action.payload };
    case 'UPDATE_SELECTED_TAXONOMY':
      return { ...state, selectedTaxonomy: action.payload };
    case 'UPDATE_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'UPDATE_SELECTED_SUBCATEGORY':
      return { ...state, selectedSubCategory: action.payload };
    default:
      return { ...state };
  }
};
