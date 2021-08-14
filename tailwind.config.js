/* eslint-disable @typescript-eslint/no-var-requires */
const smelteTailwind = require('smelte/tailwind.config.js');

const defaultSmelteConfig = smelteTailwind({});

const smelteConfig = {
  // Uncomment to override smelte default colors
  // colors: {
  //   primary: '#b027b0',
  //   secondary: '#009688',
  //   error: '#f44336',
  //   success: '#4caf50',
  //   alert: '#ff9800',
  //   blue: '#2196f3',
  //   dark: '#212121'
  // },
  darkMode: true,
  config: {
    ...defaultSmelteConfig,
    theme: {
      ...defaultSmelteConfig.theme,
      extend: {
        ...defaultSmelteConfig.theme.extend,
        colors: {
          member: {
            light: '#0E5D10',
            dark: '#04B301'
          },
          moderator: {
            light: '#2441C0',
            dark: '#A0BDFC'
          },
          owner: {
            light: '#866518',
            dark: '#FFD600'
          },
          deleted: {
            light: '#6E6B6B',
            dark: '#898888'
          }
        }
      }
    }
  }
};

module.exports = smelteTailwind(smelteConfig);
