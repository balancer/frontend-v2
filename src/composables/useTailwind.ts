import resolveConfig from 'tailwindcss/resolveConfig';
const tailwindConfig = require('../../tailwind.config.js');

export default function useTailwind() {
  return resolveConfig(tailwindConfig);
}
