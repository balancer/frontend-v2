import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from 'tailwind.config.js';
import { Config } from 'tailwindcss';

export default function useTailwind() {
  // Use any until tailwind decides to fully type resolveConfig:
  // Check related discussions:
  // https://github.com/tailwindlabs/tailwindcss/pull/9784#issuecomment-1312065258
  return resolveConfig(tailwindConfig as Config) as any;
}
