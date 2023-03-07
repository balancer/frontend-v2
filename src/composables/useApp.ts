import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';
export { version } from '../../package.json';

const modalOpen = ref(false);
const locale = ref(lsGet(LS_KEYS.App.Locale, 'en-US'));
const defaultSwapDeadlineMinutes = 100;
const transactionDeadline = ref<number>(
  lsGet(LS_KEYS.App.SwapDeadline, defaultSwapDeadlineMinutes)
);

function toggleModal() {
  modalOpen.value = !modalOpen.value;
}

function setLocale(newLocale: string) {
  locale.value = newLocale;
  lsSet(LS_KEYS.App.Locale, newLocale);
  i18n.global.locale.value = newLocale;
}

function setTransactionDeadline(newTransactionDeadline: number) {
  transactionDeadline.value = newTransactionDeadline;
  lsSet(LS_KEYS.App.SwapDeadline, newTransactionDeadline);
}

export function useApp() {
  return {
    modalOpen,
    locale,
    transactionDeadline,
    //methods
    toggleModal,
    setLocale,
    setTransactionDeadline,
  };
}
