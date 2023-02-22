// Exports from `page.client` pages are not available in
// `_default.page.server`, which is where we set the title.
export const title = 'SPA';

//TODO: Investigate hydration error:
// https://github.com/nuxt/nuxt/issues/14896

//Tip: it does not happen in https://github.com/AaronBeaudoin/vite-plugin-ssr-example/blob/main/pages/spa.page.client.vue
