import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import { Plugin, loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { version as pkgVersion } from './package.json';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import postcss from './postcss.config.js';
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry';
import viteSentry from 'vite-plugin-sentry';
import analyze from 'rollup-plugin-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';

//TODO: check how this is used
process.VITE_APP_VERSION = pkgVersion;
if (process.env.NODE_ENV === 'production') {
  process.VITE_APP_BUILD_EPOCH = new Date().getTime().toString();
}

export default defineConfig(({ mode }) => {
  // balancer-labs-SDK SOR expects this env
  // process.env = PRICE_ERROR_TOLERANCE = null;

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
    sourcemap: true,
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
      rollupOptions: {
        plugins: [
          envConfig.VITE_BUILD_ANALIZE ? analyze({ summaryOnly: false }) : null,
          envConfig.VITE_BUILD_VISUALIZE ? visualizer({ open: true }) : null,
        ],
      },
    },
    css: {
      postcss,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: 'tests/unit/vitest/setup-vitest.ts',
      coverage: { reporter: ['text', 'lcov'] }, // lcov reporter is used by IDE coverage extensions
      include: [
        'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  };
});
