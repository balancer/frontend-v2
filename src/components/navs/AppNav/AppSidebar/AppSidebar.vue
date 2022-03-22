<script lang="ts" setup>
import AppLogo from '@/components/images/AppLogo.vue';
import { useSidebar } from '@/composables/useSidebar';
import { sleep } from '@/lib/utils';
import { ref } from 'vue';

const { setSidebarOpen } = useSidebar();

const show = ref(true);

async function handlClose() {
  show.value = false;
  await sleep(300);
  setSidebarOpen(false);
}
</script>

<template>
  <Transition name="overlay" appear>
    <div v-if="show" class="sidebar-overlay">
      <div class="app-sidebar">
        <div
          class="h-20 px-4 border-b border-gray-800 flex flex-col justify-center"
        >
          <AppLogo forceDark />
        </div>

        <div class="grid grid-col-1 text-lg mt-8">
          <routerLink to="/" class="side-bar-link">Invest</routerLink>
          <routerLink to="/trade" class="side-bar-link">Trade</routerLink>
          <routerLink to="/vebal" class="side-bar-link">Vest+Vote</routerLink>
          <routerLink to="/claim" class="side-bar-link">Claim</routerLink>
          <div class="side-bar-link">Support</div>
          <BalLink
            href="https://balancer.fi/build"
            class="side-bar-link flex items-center"
            external
            noStyle
          >
            Build
            <BalIcon name="arrow-up-right" class="ml-2 text-gray-500" />
          </BalLink>
        </div>
      </div>
      <BalIcon
        name="x"
        size="lg"
        class="fixed top-8 right-8 text-white cursor-pointer"
        @click="handlClose"
      />
    </div>
  </Transition>
</template>

<style scoped>
.sidebar-overlay {
  z-index: 999999999;
  @apply fixed top-0 left-0 h-screen w-full bg-black bg-opacity-80;
}

.app-sidebar {
  @apply text-white shadow-xl h-full w-3/4 max-w-sm bg-gray-900;
}

.side-bar-link {
  @apply transition duration-300 p-4 hover:bg-gray-850 cursor-pointer;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.15s ease-in-out;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
