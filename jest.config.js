export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  collectCoverageFrom: [
    'app/**/*.js',
    '!app/**/index.js'
  ],
  transform: {},
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  moduleFileExtensions: ['js'],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};


