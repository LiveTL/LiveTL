import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  tabWidth: 2,
  printWidth: 120,
  experimentalSortImports: {
    enabled: true,
    groups: [['side_effect'], ['builtin'], ['external'], ['subpath', 'internal'], ['parent'], ['sibling']],
  },
  jsdoc: {
    preferCodeFences: true,
    separateReturnsFromParam: true,
  },
});
