import symbolKeys from '@/constants/symbol.keys';
import { InjectionKey, provide } from 'vue';
import { safeInject } from './inject';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';

export const darkModeProvider = () => {
  const osDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const lsDarkMode =
    lsGet(LS_KEYS.App.DarkMode, osDarkMode.toString()) === 'true';

  /**
   * STATE
   */
  const darkMode = ref<boolean>(lsDarkMode);

  /**
   * METHODS
   */
  function setDarkMode(val: boolean): void {
    darkMode.value = val;
    lsSet(LS_KEYS.App.DarkMode, darkMode.value.toString());
    if (darkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleDarkMode(): void {
    setDarkMode(!darkMode.value);
  }

  setDarkMode(darkMode.value);

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };
};

export type DarkModeResponse = ReturnType<typeof darkModeProvider>;
export const DarkModeProviderSymbol: InjectionKey<DarkModeResponse> = Symbol(
  symbolKeys.Providers.DarkMode
);

export function provideDarkMode() {
  provide(DarkModeProviderSymbol, darkModeProvider());
}

export function useDarkMode(): DarkModeResponse {
  return safeInject(DarkModeProviderSymbol);
}
