module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: ['@babel/plugin-proposal-numeric-separator'],
  env: {
    test: {
      plugins: ['require-context-hook'],
    },
  },
};
