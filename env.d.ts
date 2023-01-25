/// <reference types="vite/client" />

// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  readonly VITE_SENTRY_AUTH_TOKEN?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
