import { PageContextBuiltIn } from 'vite-plugin-ssr';

export type PageContext = {
  pageProps: Record<string, unknown>;
  is404: boolean;
  //TODO: use correct type
  routeParams: any;
} & PageContextBuiltIn;
