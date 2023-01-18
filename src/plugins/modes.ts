/**
 *
 * @returns true when app is built for production (staging and production builds)
 * More info: https://vitejs.dev/guide/env-and-mode.html#env-variables
 */
export function isProductionMode() {
  return import.meta.env.MODE === 'production';
}

export function isTestMode() {
  return import.meta.env.MODE === 'test';
}
