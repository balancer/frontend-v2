import { InjectionKey, provide } from 'vue';

import symbolKeys from '@/constants/symbol.keys';

import { version } from '../../package.json';

/**
 * TYPES
 */
export interface AppProviderResponse {
  version: string;
}

/**
 * SETUP
 */
export const AppProviderSymbol: InjectionKey<AppProviderResponse> = Symbol(
  symbolKeys.Providers.App
);

/**
 * AppProvider
 * Provides global app level properties
 */
export default {
  name: 'AppProvider',

  setup(props, { slots }) {
    provide(AppProviderSymbol, {
      version,
    });

    return () => slots.default();
  },
};
