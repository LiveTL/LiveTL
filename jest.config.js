module.exports = {
  moduleFileExtensions: ['js', 'svelte'],
  moduleNameMapper: {
    '^utils(.*)$': '<rootDir>/src/utils$1',
    '^.+\\.(css|less|scss)$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!svelte-materialify)'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: [
    // '<rootDir>/jest.setup.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  transform: {
    // '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
  }
};
  