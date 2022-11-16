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
    './src/jest/jest.setup-suite.jsdom.ts',
    './src/jest/jest.setup-suite.ts',
  ],
  displayName: 'dom',
  testEnvironment: 'jsdom',
  testMatch: null,
  testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$',
};
