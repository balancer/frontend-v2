module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-tailwindcss',
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'string-quotes': 'single',
    'selector-class-pattern': '',
    'keyframes-name-pattern': '',

    // Ignore "display: -webkit-box;"
    // This line clampin technique only works with the webkit prefix.
    // https://css-tricks.com/line-clampin/
    'value-no-vendor-prefix': [true, { ignoreValues: ['box'] }],

    // stylelint-config-tailwindcss and stylelint-config-recommended-vue
    // somehow conflict with each other, so we need to allow
    // tailwind's theme, and vue's v-bind functions here.
    // Check back later if this is a bug in stylelint-config-tailwindcss and it's fixed.
    'function-no-unknown': [true, { ignoreFunctions: ['v-bind', 'theme'] }],

    // Allow v-bind function (a method to use component state properties inside <style> tag)
    // keyword to be any case.
    // Use default lower case value for other functions
    'value-keyword-case': ['lower', { ignoreFunctions: ['v-bind'] }],
  },
};
