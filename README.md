# Energy Hub Dashboard - with country profiles (work in progress!)

Visualization of UNDP energy related projects.

## Features
* Load and display data for around xxx different projects.
* Interactively filter according to categories and regions.
* Display different statistics
* Display data on a map
<!-- * It includes country profiles with a dashboard showing different indicators -->

__Link for the visualization__
[https://lenseg.github.io/Energy-Hub-Dashboard/](https://lenseg.github.io/Energy-Hub-Dashboard/)

__Pages Where the Visualization is Used__
The visualization is in development at this moment and it's therefore not being used

__Link for stylesheets__
* https://undp-data.github.io/stylesheets-for-viz/style/mainStyleSheet.css
* https://icy-moss-09ab08f10.4.azurestaticapps.net

## Build with
* __React__: Used as MVC framework.
* __CRACO__: Used to configure different scripts (See Available Scripts for more details)
* __styled-components__: Utilizes tagged template literals and the power of CSS, allows to write actual CSS code to style the components in JS/TS.
* __Various D3 Libraries__: Used for visualizations, adding interaction and reading the csv data file.
* __AntD__: For UI elements like dropdown, buttons, checkbox, and slider.
* __lodash__: Used for manipulating and iterating arrays and objects.

## Installation

This project uses `npm`. For installation you will need to install `node` and `npm`, if you don't already have it. `node` and `npm` can be installed from [here](https://nodejs.org/en/download/).

To install the project, sinply clone the the repo and them run `npm install` in the project folder. You can use terminal on Mac and Command Prompt on Windows.

Run the terminal or command prompt and then run the following

```
git clone https://github.com/UNDP-Data/Energy-Hub-Dashboard/
cd Energy-Hub-Dashboard
npm install
```

### Local Development

To start the project locally, you can run `npm run start` in the project folder in terminal or command prompt.

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

## Tooling Setup

This project uses ESLint integrated with prettier, which verifies and formats your code so you don't have to do it manually. You should have your editor set up to display lint errors and automatically fix those which it is possible to fix. See [http://eslint.org/docs/user-guide/integrations](http://eslint.org/docs/user-guide/integrations).

This project is build in Visual Studio Code, therefore the project is already set up to work with. Install it from [here](https://code.visualstudio.com/) and then install this [eslint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and you should be good to go.

## Available Scripts

Craco is used to add a cofiguration layer for CRA. The primary function is to stop the `build` to have optimized chunks of the built script. _This make the using the script in the Wordpress easier._ The configuration file for Craco is placed in the root folder and called `craco.config.js`
* `npm run build`: Executes `craco build` and builds the app without chunking the main js script file.
* `npm run start`: Executes `craco start` and start the local server for local deployment.
* `npm install`: Installs all the dependencies.


## File Tree Structure

File tree is based on UNDP react project template

* `src/lang`: Language files for i18n.
* `public/data`: Datasets.
* `src/firebase`: Intergation with firebase.
* `src/Data`: World map GeoJSON to generate map.


## Tooling Setup
This project uses ESLint integrated with prettier, which verifies and formats your code so you don't have to do it manually. You should have your editor set up to display lint errors and automatically fix those which it is possible to fix. See [http://eslint.org/docs/user-guide/integrations](http://eslint.org/docs/user-guide/integrations).

This project is build in Visual Studio Code, therefore the project is already set up to work with. Install it from [here](https://code.visualstudio.com/) and then install this [eslint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and you should be good to go.

## Author

Latest updates by [**Anton Stepanenkov**](mailto:lenseg1@gmail.com)
