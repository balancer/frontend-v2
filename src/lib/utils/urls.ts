export function buildURL(url: string): string {
  // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
  return new URL(url, import.meta.url).href;
}
