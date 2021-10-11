module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['./src/tests/jest.setup.ts'],
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel'
};
