module.exports = {
  root: true,

  env: {
    node: true,
  },

  globals: {
    NodeJS: true
  },

  extends: [
    'eslint:recommended',
    "plugin:@typescript-eslint/recommended",
    'plugin:vue/vue3-recommended',
  ],

  plugins: ['simple-import-sort'],

  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
  },

  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],

    // New ignore rule
    'vue/multi-word-component-names': 'off'
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
