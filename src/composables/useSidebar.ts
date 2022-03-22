import { ref } from 'vue';

/**
 * STATE
 */
const sidebarOpen = ref(false);

/**
 * METHODS
 */
function setSidebarOpen(newVal: boolean) {
  sidebarOpen.value = newVal;
}

export function useSidebar() {
  return {
    sidebarOpen,
    setSidebarOpen
  };
}
