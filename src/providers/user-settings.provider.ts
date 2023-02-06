import { parseUnits } from '@ethersproject/units';
import { computed, inject, InjectionKey, provide, reactive, toRefs } from 'vue';

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

/**
 * SETUP
 */
const lsCurrency = lsGet(LS_KEYS.UserSettings.Currency, FiatCurrency.usd);
const lsSlippage = lsGet(LS_KEYS.App.SwapSlippage, '0.01');

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
  lsSet(LS_KEYS.App.SwapSlippage, newSlippage);
  state.slippage = newSlippage;
}

export const userSettingsProvider = () => {
  return {
    ...toRefs(state),
    // methods
    setCurrency,
    setSlippage,
    slippageScaled,
    slippageBsp,
  };
};

export type UserSettingsResponse = ReturnType<typeof userSettingsProvider>;
export const providerResponse = {} as UserSettingsResponse;
export const UserSettingsProviderSymbol: InjectionKey<UserSettingsResponse> =
  Symbol(symbolKeys.Providers.App);

export function provideUserSettings(): UserSettingsResponse {
  const userSettings = userSettingsProvider();
  provide(UserSettingsProviderSymbol, userSettings);
  return userSettings;
}

export const useUserSettings = (): UserSettingsResponse => {
  return inject(UserSettingsProviderSymbol, providerResponse);
};
