module.exports = {
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-selector-bem-pattern',
    'stylelint-config-recommended-vue',
    'stylelint-config-tailwindcss'
  ],
  rules: {
    'string-quotes': 'single',
    // ignored tailwind's theme, and vue's v-bind functions
    'function-no-unknown': [true, { ignoreFunctions: ['v-bind', 'theme'] }]
  }
};
