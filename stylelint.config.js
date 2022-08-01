module.exports = {
  customSyntax: 'postcss-html',
  extends: [
    'stylelint-config-standard',
    'stylelint-selector-bem-pattern',
    'stylelint-config-recommended-vue',
    'stylelint-config-tailwindcss',
    'stylelint-config-prettier',
  ],
  rules: {
    'string-quotes': 'single',
    // Allow tailwind's theme, and vue's v-bind functions
    'function-no-unknown': [true, { ignoreFunctions: ['v-bind', 'theme'] }],

    // Allow v-bind function (a method to use component state properties inside <style> tag)
    // keyword to be any case.
    // Use default lower case value for other functions
    'value-keyword-case': ['lower', { ignoreFunctions: ['v-bind'] }],
  },
};
