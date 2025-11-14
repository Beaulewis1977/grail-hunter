export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.js.map'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Setup file to suppress expected console warnings in test environment
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
