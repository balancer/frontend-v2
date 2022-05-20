module.exports = {
  root: true,

  env: {
    node: true
  },

  globals: {
    NodeJS: true,
    withDefaults: true,
    defineProps: true,
    defineEmits: true,
    defineExpose: true
  },

  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint',
    '@vue/typescript'
  ],

  plugins: ['simple-import-sort'],

  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-undef': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn'
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
};
