<script lang="ts" setup>
import { ref } from 'vue';

import { useSidebar } from '@/composables/useSidebar';

import SidebarContent from './SidebarContent.vue';

/**
 * STATE
 */
const showSidebar = ref(false);

/**
 * COMPOSABLES
 */
const { setSidebarOpen } = useSidebar();
</script>

<template>
  <Transition name="overlay" @afterEnter="showSidebar = true" appear>
    <div class="sidebar-overlay">
      <Transition name="sidebar" @afterLeave="setSidebarOpen(false)">
        <div v-if="showSidebar" class="app-sidebar">
          <SidebarContent @close="showSidebar = false" />
        </div>
      </Transition>
      <div class="app-sidebar_empty" @click="showSidebar = false">
        <BalIcon
          name="x"
          size="lg"
          class="close-icon flex justify-center items-center fixed top-4 right-2 text-white cursor-pointer"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sidebar-overlay {
  z-index: 999999999;
  @apply fixed top-0 left-0 h-screen w-full bg-black bg-opacity-80 cursor-pointer flex;
  backdrop-filter: blur(5px);
}

.app-sidebar {
  @apply text-white shadow-xl h-full w-3/4 max-w-sm bg-gray-900 cursor-default overflow-y-auto pb-4;
  will-change: transform;
}

.app-sidebar_empty {
  @apply flex-grow;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.1s ease-in-out;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.25s ease-in-out;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.close-icon {
  @apply overflow-hidden rounded-full w-9 h-9;
  animation: spin-quarter 0.3s ease-out both;
}

.close-icon:before {
  @apply w-9 h-9 flex items-center justify-center absolute rounded-full;
  content: '';
  z-index: -1;
  background: rgba(150, 150, 150, 0.2);
  backdrop-filter: blur(4px);
}
</style>
