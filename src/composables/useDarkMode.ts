import { ref } from 'vue';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';
import useBlocknative from './useBlocknative';

const osDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// STATE
const darkMode = ref<boolean>(lsGet(LS_KEYS.App.DarkMode, osDarkMode));

// MUTATIONS
function setDarkMode(val: boolean): void {
  darkMode.value = val;
  lsSet(LS_KEYS.App.DarkMode, darkMode.value);
  if (darkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// INIT
setDarkMode(darkMode.value);

export default function useDarkMode() {
  const { updateNotifyConfig } = useBlocknative();

  function toggleDarkMode(): void {
    setDarkMode(!darkMode.value);
    updateNotifyConfig({ darkMode: darkMode.value });
  }

  return {
    darkMode,
    toggleDarkMode
  };
}
