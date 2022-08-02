import '../src/assets/css/tailwind.css';
import '../src/assets/css/index.css';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config';
import '@storybook/addon-console';

const fullConfig = resolveConfig(tailwindConfig);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    values: [
      { name: 'light', value: fullConfig.theme.colors.gray['50'] },
      { name: 'dark', value: fullConfig.theme.colors.gray['900'] },
    ],
  },
};
