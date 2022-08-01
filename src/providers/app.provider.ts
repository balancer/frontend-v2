import { computed, ComputedRef, InjectionKey, provide } from 'vue';
import { useStore } from 'vuex';

import useTokens from '@/composables/useTokens';
import symbolKeys from '@/constants/symbol.keys';

import { version } from '../../package.json';

/**
 * TYPES
 */
export interface AppProviderResponse {
  version: string;
  appLoading: ComputedRef<boolean>;
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
    const store = useStore();
    const { loading: loadingTokens } = useTokens();

    const appLoading = computed(
      () => store.state.app.loading || loadingTokens.value
    );

    provide(AppProviderSymbol, {
      version,
      // computed
      appLoading,
    });

    return () => slots.default();
  },
};
