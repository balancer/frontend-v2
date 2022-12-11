import { parseUnits } from '@ethersproject/units';
import {
  computed,
  ComputedRef,
  // InjectionKey,
  provide,
  reactive,
  Ref,
  toRefs,
} from 'vue';

import { FiatCurrency } from '@/constants/currency';
import LS_KEYS from '@/constants/local-storage.keys';
import symbolKeys from '@/constants/symbol.keys';
import { lsGet, lsSet } from '@/lib/utils';

/**
 * TYPES
 */
export interface UserSettingsState {
  currency: FiatCurrency;
  slippage: string;
}

export interface UserSettingsProviderResponse {
  currency: Ref<FiatCurrency>;
  slippage: Ref<string>;
  slippageScaled: ComputedRef<string>;
  slippageBsp: ComputedRef<number>;
  setCurrency: (newCurrency: FiatCurrency) => void;
  setSlippage: (newSlippage: string) => void;
}

/**
 * SETUP
 */
export const UserSettingsProviderSymbol = Symbol(
  symbolKeys.Providers.UserSettings
);

const lsCurrency = lsGet(LS_KEYS.UserSettings.Currency, FiatCurrency.usd);
const lsSlippage = lsGet(LS_KEYS.App.TradeSlippage, '0.01');

/**
 * STATE
 */
const state: UserSettingsState = reactive({
  currency: lsCurrency,
  slippage: lsSlippage,
});

/**
 * COMPUTED
 */
const slippageScaled = computed((): string =>
  parseUnits(state.slippage, 18).toString()
);
const slippageBsp = computed<number>(() => parseFloat(state.slippage) * 10000);

/**
 * METHODS
 */
function setCurrency(newCurrency: FiatCurrency): void {
  lsSet(LS_KEYS.UserSettings.Currency, newCurrency);
  state.currency = newCurrency;
}

function setSlippage(newSlippage: string): void {
  lsSet(LS_KEYS.App.TradeSlippage, newSlippage);
  state.slippage = newSlippage;
}

/**
 * UserSettingsProvider
 * Provides global user settings interface
 */
export default {
  name: 'UserSettingsProvider',

  setup(props, { slots }) {
    provide(UserSettingsProviderSymbol, {
      ...toRefs(state),
      // methods
      setCurrency,
      setSlippage,
      slippageScaled,
      slippageBsp,
    });

    return () => slots.default();
  },
};
