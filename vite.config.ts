import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';
import { version as pkgVersion } from './package.json';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import postcss from './postcss.config.js';

//TODO: check how this is used
process.VITE_APP_VERSION = pkgVersion;
if (process.env.NODE_ENV === 'production') {
  process.VITE_APP_BUILD_EPOCH = new Date().getTime().toString();
}

export default defineConfig(() => {
  // balancer-labs-SDK SOR expects this env
  // process.env = PRICE_ERROR_TOLERANCE = null;

  return {
    define: {
      'process.env': {},
    },
    plugins: [
      vue(),
      nodePolyfills(),
      // AutoImport({
      //   imports: [
      //     'vue',
      //     'vue-router',
      //   ],
      //   dts: 'src/auto-imports.d.ts',
      //   eslintrc: {
      //     enabled: true,
      //   },
      // }),
      Components({
        dirs: ['src/components/_global/**'],
        extensions: ['vue'],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@types': resolve(__dirname, './types'),
        '@tests': resolve(__dirname, './tests'),
      },
    },
    server: {
      port: 8080,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
    },
    build: {
      minify: true,
    },
    css: {
      postcss,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: 'tests/unit/vitest/setup-vitest.ts',
      // coverage: { reporter: ['text', 'lcov'] }, // lcov reporter is used by IDE coverage extensions
      include: [
        'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  };
});
