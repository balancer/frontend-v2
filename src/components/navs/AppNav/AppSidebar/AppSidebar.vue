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
      <BalIcon
        name="x"
        size="lg"
        class="fixed top-8 right-8 text-white cursor-pointer"
        @click="showSidebar = false"
      />
    </div>
  </Transition>
</template>

<style scoped>
.sidebar-overlay {
  z-index: 999999999;
  @apply fixed top-0 left-0 h-screen w-full bg-black bg-opacity-80 cursor-pointer;
}

.app-sidebar {
  @apply text-white shadow-xl h-full w-3/4 max-w-sm bg-gray-900 cursor-default overflow-y-auto pb-4;
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
</style>
