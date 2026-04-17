const path = require('path');

module.exports = {
  devServer: (devServerConfig) => {
    const existingStatic = Array.isArray(devServerConfig.static)
      ? devServerConfig.static
      : (devServerConfig.static ? [devServerConfig.static] : []);

    return {
      ...devServerConfig,
      static: [
        ...existingStatic,
        {
          directory: path.resolve(__dirname, 'data'),
          publicPath: '/fe-energy-moonshot/data',
          watch: true,
        },
      ],
    };
  },
};
