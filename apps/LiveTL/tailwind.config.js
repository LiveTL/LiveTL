const palette = (base, dark) => ({
  50: base,
  200: base,
  300: base,
  400: base,
  500: base,
  600: dark,
  700: dark,
  800: dark,
  900: dark,
  transDark: `${base}26`,
});

module.exports = {
  content: ['./src/**/*.{html,js,ts,svelte}', '../HyperChat/src/**/*.{html,js,ts,svelte}'],
  darkMode: ['class', '.mode-dark'],
  theme: {
    extend: {
      colors: {
        primary: palette('#2196f3', '#1479ed'),
        blue: palette('#2196f3', '#1479ed'),
        secondary: palette('#3f51b5', '#29379d'),
        error: palette('#f44336', '#ef2c22'),
        success: palette('#4caf50', '#339637'),
        alert: palette('#ff9800', '#f57c00'),
        dark: palette('#424242', '#212121'),
        member: { light: '#0E5D10', dark: '#04B301' },
        moderator: { light: '#2441C0', dark: '#A0BDFC' },
        owner: { light: '#866518', dark: '#FFD600' },
        deleted: { light: '#6E6B6B', dark: '#898888' },
        translated: { light: '#0050da', dark: '#b9d9ff' },
        ytbg: { light: '#ffffff', dark: '#0f0f0f' },
      },
      width: {
        '1/7': '14.2857143%', '2/7': '28.5714286%', '3/7': '42.8571429%',
        '4/7': '57.1428571%', '5/7': '71.4285714%', '6/7': '85.7142857%',
      },
    },
  },
  safelist: [{ pattern: /^(bg|text|hover:bg)-(primary|blue|secondary|error|success|alert|dark)-(50|200|300|400|500|600|700|800|900)$/ }],
};
