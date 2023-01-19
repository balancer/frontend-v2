import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { version as pkgVersion } from './package.json';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import rollupPolyfillNode from 'rollup-plugin-polyfill-node';
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry';
import viteSentry from 'vite-plugin-sentry';
import analyze from 'rollup-plugin-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, process.cwd());

  const plugins = [
    vue(),
    createHtmlPlugin({
      minify: false,
      inject: {
        data: {
          VITE_FATHOM_SITE_ID: envConfig.VITE_FATHOM_SITE_ID,
        },
      },
    }),
    // avoid nodePolyfills in vitest:
    mode === 'test' ? null : nodePolyfills(),
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
      dts: true,
    }),
    VueI18nPlugin({
      /* options */
      // locale messages resource pre-compile option
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './src/locales/**'
      ),
    }),
  ];

  if (mode === 'production' && envConfig.VITE_SENTRY_AUTH_TOKEN) {
    /**
     * Configure sentry plugin
     */
    const sentryConfig: ViteSentryPluginOptions = {
      url: 'https://sentry.io',
      authToken: envConfig.VITE_SENTRY_AUTH_TOKEN,
      org: 'balancer-labs',
      project: 'app',
      release: `frontend-v2@${pkgVersion}`,
      deploy: {
        env: 'production',
      },
      setCommits: {
        auto: true,
      },
      sourceMaps: {
        include: ['./dist/assets'],
        ignore: ['node_modules', 'vite.config.ts'],
        urlPrefix: '~/assets',
      },
    };
    plugins.push(viteSentry(sentryConfig));
  }

  return {
    define: {
      'process.env': {},
    },
    plugins: plugins,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@types': resolve(__dirname, './types'),
        '@tests': resolve(__dirname, './tests'),
        // Allows to import tailwind.config.js from useTailwind.ts
        // Check: https://github.com/tailwindlabs/tailwindcss.com/issues/765
        'tailwind.config.js': resolve(__dirname, 'tailwind.config.js'),
      },
    },
    optimizeDeps: {
      include: ['tailwind.config.js', 'color', 'mersenne-twister'],
    },
    server: {
      port: 8080,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
      strictPort: true,
      host: true,
    },
    preview: {
      port: 8080,
      host: true,
      strictPort: true,
    },
    build: {
      sourcemap: true,
      minify: true,
      rollupOptions: {
        plugins: [
          envConfig.VITE_BUILD_ANALIZE ? analyze({ summaryOnly: false }) : null,
          envConfig.VITE_BUILD_VISUALIZE ? visualizer({ open: true }) : null,
          // https://stackoverflow.com/a/72440811/10752354
          rollupPolyfillNode(),
        ],
      },
      commonjsOptions: {
        // Allows to import tailwind.config.js from useTailwind.ts
        // Check: https://github.com/tailwindlabs/tailwindcss.com/issues/765
        include: ['tailwind.config.js', 'node_modules/**'],
        transformMixedEsModules: true, // Enable @walletconnect/web3-provider which has some code in CommonJS
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: [
        'tests/unit/vitest/setup-vitest.ts',
        // https://github.com/jest-community/jest-extended/tree/main/examples/typescript/all
        'jest-extended/all',
      ],
      coverage: { reporter: ['text', 'lcov'] }, // lcov reporter is used by IDE coverage extensions
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  };
});
