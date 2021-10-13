module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  roots: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['./src/jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: null,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$'
};
