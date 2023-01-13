import resolveConfig from 'tailwindcss/resolveConfig';

// Note that we are explicitly importing from 'tailwind.config.js' which is a vite alias (see vite.config.ts)
// because we need to use ES modules but tailwind + tailwind intellisense require commonJS import style to work properly.
import tailwindConfig from 'tailwind.config.js';

export default function useTailwind() {
  return resolveConfig(tailwindConfig);
}
