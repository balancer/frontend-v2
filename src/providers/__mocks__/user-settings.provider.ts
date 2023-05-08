import { FiatCurrency } from '@/constants/currency';
import { mock } from 'vitest-mock-extended';
import { ref } from 'vue';
import { UserSettingsResponse } from '../user-settings.provider';

let slippage = '0.01';

export const mockUserSettingsProvider = mock<UserSettingsResponse>();
mockUserSettingsProvider.currency = ref(FiatCurrency.usd);
mockUserSettingsProvider.slippage = ref(slippage);

export function _setSlippage(value: string) {
  slippage = value;
}

export function provideUserSettings(): UserSettingsResponse {
  return mockUserSettingsProvider;
}

export function useUserSettings(): UserSettingsResponse {
  return mockUserSettingsProvider;
}
