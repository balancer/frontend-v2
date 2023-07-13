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
    './.eslintrc-auto-import.json',
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
    // Typescript forces to check optional props for "undefined" values anyway, so this rule is not needed
    'vue/require-default-prop': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            // Avoid imports using 'ethers/lib/*' because they lead to compilation issues in vite rollup builds
            group: ['ethers/lib/*'],
            message:
              "Please import from '@ethersproject/*' instead to avoid vite rollup build issues",
          },
          {
            group: ['*/lib/balancer.sdk'],
            importNames: ['balancer'],
            message:
              'Please import from src/dependencies to make this dependency more testable',
          },
          {
            group: ['@sobal/sdk'],
            importNames: ['PoolsFallbackRepository'],
            message:
              'Please import from src/dependencies to make this dependency more testable',
          },
          {
            group: ['@/lib/utils/balancer/contract'],
            importNames: ['Multicaller'],
            message:
              'Please import from src/dependencies to make this dependency more testable',
          },
          {
            group: ['@/services/web3/transactions/concerns/contract.concern'],
            importNames: ['ContractConcern'],
            message:
              'Please import from src/dependencies to make this dependency more testable',
          },
          // {
          //   group: ['@/services/multicalls/multicaller'],
          //   importNames: ['Multicaller'],
          //   message:
          //     'Please import from src/dependencies to make this dependency more testable',
          // },
          {
            group: ['@ethersproject/providers'],
            importNames: ['Web3Provider'],
            message:
              'Please import from src/dependencies to make this dependency more testable',
          },
          {
            group: ['@sobal/sdk'],
            importNames: ['Network'],
            message:
              'Please import Network from @/lib/config to avoid adding SDK to bundle',
          },
        ],
      },
    ],
    // 'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
  },

  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
    {
      files: ['src/services/api/graphql/generated/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
