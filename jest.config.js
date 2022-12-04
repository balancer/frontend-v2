module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  roots: ['<rootDir>/src/'],
  setupFiles: ['./src/jest/jest.setup.jsdom.ts'],
  setupFilesAfterEnv: [
    // https://github.com/jest-community/jest-extended/tree/main/examples/typescript/all
    'jest-extended/all',
    './src/jest/jest.setup-suite.jsdom.ts',
    './src/jest/jest.setup-suite.ts',
  ],
  displayName: 'dom',
  testEnvironment: 'jsdom',
  testMatch: null,
  testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
  transformIgnorePatterns: [
    '/node_modules/(?!(echarts|zrender|vue-slider-component|vue3-jazzicon)/)',
  ],
  moduleNameMapper: {
    '/public/data/tokenlists/tokens-5.json':
      '<rootDir>/src/tests/tokenlists/tokens-5.json',
  },
};
