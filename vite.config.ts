import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { Plugin, loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { version as pkgVersion } from './package.json';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import rollupPolyfillNode from 'rollup-plugin-polyfill-node';
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry';
import viteSentry from 'vite-plugin-sentry';
import analyze from 'rollup-plugin-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const plugins = [
    vue(),
    // Type assertion to avoid TS errors in defineConfig
    nodePolyfills() as unknown as Plugin,
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
  ];

  const envConfig = loadEnv(mode, process.cwd());

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
        include: ['./dist'],
        // include: ['./dist/assets'],
        ignore: ['node_modules', 'vite.config.ts'],
        // urlPrefix: '~/assets',
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
      include: ['tailwind.config.js'],
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
    },
    preview: {
      port: 8080,
      host: 'localhost',
      strictPort: true,
    },
    build: {
      sourcemap: false,
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
      include: [
        'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  };
});
