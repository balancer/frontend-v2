import { resolve } from 'path';
// import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  return {
    define: {
      'process.env': {},
    },
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
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: [
        'tests/unit/vitest/setup-vitest.ts',
        // https://github.com/jest-community/jest-extended/tree/main/examples/typescript/all
        // 'jest-extended/all',
      ],
      coverage: { reporter: ['text', 'lcov'] }, // lcov reporter is used by IDE coverage extensions
      include: [
        'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
  };
});
