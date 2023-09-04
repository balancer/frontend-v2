// import { lsGet, lsSet } from '@/lib/utils/localstorage';

// const DarkMode = 'app.darkMode';

// const osDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
// const lsDarkMode = lsGet(DarkMode, osDarkMode.toString()) === 'true';

// STATE
const darkMode = { value: false };

// // MUTATIONS
function setDarkMode(val: boolean): void {
  darkMode.value = val;
  // lsSet(DarkMode, darkMode.value.toString());
  // if (darkMode.value) {
  //   document.documentElement.classList.add('dark');
  // } else {
  //   document.documentElement.classList.remove('dark');
  // }
}

// // INIT
// setDarkMode(darkMode.value);

export default function useDarkMode() {
  function toggleDarkMode(): void {
    setDarkMode(!darkMode.value);
  }

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };
}
