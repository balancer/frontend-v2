module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  projects: [
    {
      preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
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
    },
    {
      preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
      roots: ['<rootDir>/src/'],
      setupFilesAfterEnv: ['./src/jest/jest.setup-suite.ts'],
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: null,
      testRegex: '(\\.|/)(test|spec.node)\\.[jt]sx?$',
    },
  ],
};
