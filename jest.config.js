module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/jest.setup.ts'],
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel'
};
