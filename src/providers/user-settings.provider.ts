import { provide, InjectionKey, reactive, Ref, toRefs } from 'vue';
import symbolKeys from '@/constants/symbol.keys';
import LS_KEYS from '@/constants/local-storage.keys';
import { FiatCurrency } from '@/constants/currency';
import { lsGet } from '@/lib/utils';

/**
 * TYPES
 */
export interface UserSettingsState {
  currency: FiatCurrency;
}

export interface UserSettingsProviderResponse {
  currency: Ref<FiatCurrency>;
  setCurrency: (newCurrency: FiatCurrency) => void;
}

/**
 * SETUP
 */
export const UserSettingsProviderSymbol: InjectionKey<UserSettingsProviderResponse> = Symbol(
  symbolKeys.Providers.App
);

const lsCurrency = lsGet(LS_KEYS.UserSettings.Currency, FiatCurrency.usd);

/**
 * STATE
 */
const state: UserSettingsState = reactive({
  currency: lsCurrency
});

/**
 * UserSettingsProvider
 * Provides global user settings interface
 */
export default {
  name: 'UserSettingsProvider',

  setup(props, { slots }) {
    /**
     * METHODS
     */
    function setCurrency(newCurrency: FiatCurrency): void {
      state.currency = newCurrency;
    }

    provide(UserSettingsProviderSymbol, {
      ...toRefs(state),
      // methods
      setCurrency
    });

    return () => slots.default();
  }
};
