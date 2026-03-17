# UNDP Energy Moonshot Tracker

## Overview

This repository contains the deployable frontend bundle for the **UNDP Energy Moonshot Tracker**.  
The tracker visualizes UNDP energy project data, targeted beneficiaries, and country-level indicators in support of the Strategic Plan 2022-2025.

The app includes:

- A landing experience describing the Energy Moonshot and the “path to 500 million”.
- A filterable global tracker with summary cards, stacked filter charts, and an interactive world map.
- A project-level table with editable fields and a feedback form.

## What Is In This Repository

This is a **static-site deployment artifact**, not a full source repository.

- Runtime entry: `index.html`
- JS/CSS bundles: `static/js`, `static/css`
- Static media: `static/media`
- Data files consumed at runtime: `data/*`
- Hosting config: `_headers`, `_redirects`

There are no `package.json`, `src/`, or lock files in this repo.

## Moonshot Tracker

- Top-level taxonomy filters:
  - Output category (All, Energy Access, Energy Transition, Policy)
  - Output subcategory (depends on selected category)
- Side filters and stacked charts:
  - Funding source (vertical vs non-vertical)
  - Country grouping (regional bureau, income group, HDI tier, special groupings, individual country)
  - Gender marker (GEN0-3 + no marker)
- KPI cards:
  - People benefiting (contextual by category)
  - Number of projects
  - Number of countries
  - Total grant amount
- Global choropleth map with zoom/pan and indicator selector
- Project table showing country, funding, gender marker, outputs, and descriptions

### Feedback and edits workflow

- Inline editable table cells can submit proposed edits
- Feedback form can submit comments
- Both are sent to Firebase Firestore collections (`edits`, `comments`)

## Architecture (as inferred from source maps)

The bundle was built from a React + TypeScript app (Create React App style output), using:

- `react`, `react-dom`
- `styled-components`
- `d3` packages (`d3-request`, `d3-queue`, `d3-geo`, `d3-scale`, etc.)
- `antd`
- `react-i18next`
- Firebase SDK (`firebase/app`, `firebase/firestore`)

State management is based on React Context + reducer:

- `Context/Context.tsx`
- `Context/Reducer.tsx`

Primary app composition:

- `App.tsx` loads data and provides context
- `Global/index.tsx` computes filtered aggregates and renders:
  - `Cards`
  - `Settings`
  - `BarFilters`
  - `UnivariateMap`
  - `DataTable`

Internationalization:

- Languages: English, Spanish, French
- i18n initialized in `i18n.tsx`

## Runtime Data Inputs

### Local files (required)

- `data/indicatorMetaData.json`
- `data/moonshotData.json`
- `data/countrylinkdict.json`
- `data/worldMap.json`
- `data/moonshot-toolips.json`

### Remote files (required at runtime)

- Country taxonomy:
  - `https://raw.githubusercontent.com/UNDP-Data/country-taxonomy-from-azure/main/country_territory_groups.json`
- Country bounding box mapping:
  - `https://gist.githubusercontent.com/cplpearce/3bc5f1e9b1187df51d2085ffca795bee/raw/b36904c0c8ea72fdb82f68eb33f29891095deab3/country_codes`

If these remote endpoints are unavailable, parts of the app will fail to render fully.

## Data Folder Layout

`data/moonshotData.json` is the primary data file that needs to be input when data is updated. 
