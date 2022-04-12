import { ref } from 'vue';

/**
 * STATE
 */
const isSidebarOpen = ref(false);

/**
 * METHODS
 */
function setSidebarState(newVal: boolean): void {
  isSidebarOpen.value = newVal;
}

export function useSidebar() {
  return {
    isSidebarOpen,
    setSidebarState
  };
}
