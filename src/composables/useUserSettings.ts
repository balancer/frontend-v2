import { ref } from 'vue';
import { lsGet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';
import { FiatCurrency } from '@/constants/currency';

/** LOCAL STORAGE */
const lsCurrency = lsGet(LS_KEYS.UserSettings.Currency, FiatCurrency.usd);

/** STATE */
const currency = ref<FiatCurrency>(lsCurrency);

/** MUTATIONS */
function setCurrency(newCurrency: FiatCurrency): void {
  currency.value = newCurrency;
}

export default function useUserSettings() {
  return {
    // state
    currency,
    // methods
    setCurrency
  };
}
