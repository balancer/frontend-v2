module.exports = {
  root: true,

  env: {
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier-vue/recommended',
  ],

  plugins: ['simple-import-sort', 'tailwindcss'],

  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
  },

  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'tailwindcss/no-custom-classname': 'off',

    // Require passing prop names in camelCase
    'vue/attribute-hyphenation': ['error', 'never'],

    // Inserting html is a potential XSS risk. Consider disabling this rule case-by-case basis
    'vue/no-v-html': 'off',

    // Our component names are already written in PascalCase.
    // And for consistency, it's now required too.
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],

    // Vue recommends multi word component names, so they don't get mixed with
    // regular html elements, but many component's names are already single
    // word, so had to turn this off.
    'vue/multi-word-component-names': 'off',

    // Event names are written in kebab-case, as it's in plugin:vue/vue3-recommended.
    // This just turns the autofix option on.
    'vue/v-on-event-hyphenation': [
      'error',
      'always',
      {
        autofix: true,
      },
    ],
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
