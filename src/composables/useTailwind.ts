import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config.js';

export default function useTailwind() {
  return resolveConfig(tailwindConfig);
}
