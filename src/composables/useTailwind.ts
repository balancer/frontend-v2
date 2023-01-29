import resolveConfig from 'tailwindcss/resolveConfig';
import { Config } from 'tailwindcss';
// Note that we are explicitly importing from 'tailwind.config.js' which is a vite alias (see vite.config.ts)
// because we need to use ES modules but tailwind + tailwind intellisense require commonJS import style to work properly.
import tailwindConfig from 'tailwind.config.js';

export default function useTailwind() {
  // Use any until tailwind decides to fully type resolveConfig:
  // Check related discussions:
  // https://github.com/tailwindlabs/tailwindcss/pull/9784#issuecomment-1312065258
  return resolveConfig(tailwindConfig as Config) as any;
}
