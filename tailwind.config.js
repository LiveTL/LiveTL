const smelteTailwind = require('smelte/tailwind.config.js');

const colors = {
  primary: '#2196F3',
  secondary: '#3f51b5',
  error: '#f44336',
  success: '#4caf50',
  alert: '#ff9800',
  blue: '#2196f3',
  dark: '#212121'
};

const smelteConfig = {
  colors,
  darkMode: true,
  theme: {
    extend: {
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
        },
        translated: {
          light: '#0050da',
          dark: '#b9d9ff'
        }
      }
    }
  }
};

module.exports = smelteTailwind(smelteConfig);
