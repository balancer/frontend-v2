import { extractPrefetchAssets } from './prefetch';

// Example of string returned by vite's async import
// More details: https://github.com/vitejs/vite/issues/10600
const stringifiedViteImport = `import("./swap-e51e71cb.js"),["assets/swap-e51e71cb.js","assets/BalAccordion.vue_vue_type_script_setup_true_lang-c2dd96ca.js","assets/immutable-8725a18b.js","assets/connector-0989baba.js","assets/BalAsset-a8105779.css","assets/BalAssetSet-68519eb3.css"])`;

test('Extracts hashed assets from assets string', async () => {
  const assets = extractPrefetchAssets(stringifiedViteImport);

  expect(assets).toEqual([
    'assets/swap-e51e71cb.js',
    'assets/BalAccordion.vue_vue_type_script_setup_true_lang-c2dd96ca.js',
    'assets/immutable-8725a18b.js',
    'assets/connector-0989baba.js',
    'assets/BalAsset-a8105779.css',
    'assets/BalAssetSet-68519eb3.css',
  ]);
});
