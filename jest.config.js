module.exports = {
  testPathIgnorePatterns: ['<rootDir>/mobile/'],
  testRegex: '(//.*|(\\.|/)(test|spec))\\.js?$',
  verbose: true,
  testURL: 'http://localhost/',
  moduleFileExtensions: ['js'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/test/coverage',
  collectCoverageFrom: ['<rootDir>/server/**/*.js'],
};
