module.exports = {
  projects: [
    {
      preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
      roots: ['<rootDir>/src/'],
      setupFilesAfterEnv: ['./src/jest.setup.ts'],
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: null,
      testRegex: '(\\.|/)(test|spec)\\.[jt]sx?$'
    },
    {
      preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
      roots: ['<rootDir>/src/'],
      setupFilesAfterEnv: ['./src/jest.setup.ts'],
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: null,
      testRegex: '(\\.|/)(test|spec.node)\\.[jt]sx?$'
    }
  ]
};
