import useTokenLists2 from '@/composables/useTokenLists2';
import useTokens2 from '@/composables/useTokens2';
import symbolKeys from '@/constants/symbol.keys';
import { provide, computed, InjectionKey, ComputedRef } from 'vue';
import { useStore } from 'vuex';

/**
 * TYPES
 */
export interface AppProviderResponse {
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
    const { loadingTokenLists } = useTokenLists2();
    const { loading: loadingTokens } = useTokens2();

    const appLoading = computed(
      () =>
        store.state.app.loading ||
        loadingTokenLists.value ||
        loadingTokens.value
    );

    provide(AppProviderSymbol, {
      // computed
      appLoading
    });

    return () => slots.default();
  }
};
