const sharedOptions = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  roots: ['<rootDir>/src/'],
  testMatch: null,
  transformIgnorePatterns: [
    '/node_modules/(?!(echarts|zrender|vue-slider-component|vue3-jazzicon)/)',
  ],
};

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  projects: [
    {
      setupFiles: ['./src/jest/jest.setup.jsdom.ts'],
      setupFilesAfterEnv: [
        './src/jest/jest.setup-suite.jsdom.ts',
        './src/jest/jest.setup-suite.ts',
      ],
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
      ...sharedOptions,
    },
    {
      setupFilesAfterEnv: ['./src/jest/jest.setup-suite.ts'],
      displayName: 'node',
      testEnvironment: 'node',
      testRegex: '(\\.|/)(test|spec.node)\\.[jt]sx?$',
      ...sharedOptions,
    },
  ],
};
