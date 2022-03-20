<script lang="ts" setup>
import AppLogo from '@/components/images/AppLogo.vue';
</script>

<template>
  <div class="sidebar-overlay">
    <div class="app-sidebar h-full w-3/4 bg-gray-900">
      <div
        class="h-20 px-4 border-b border-gray-800 flex flex-col justify-center"
      >
        <AppLogo forceDark />
      </div>

      <div class="grid grid-col-1 text-lg">
        <routerLink to="/">Invest</routerLink>
        <routerLink to="/trade">Trade</routerLink>
        <routerLink to="/vebal">Vest+Vote</routerLink>
        <routerLink>Support</routerLink>
        <a href="https://balancer.fi/build">
          Build
        </a>
      </div>
    </div>
    <BalIcon
      name="x"
      size="lg"
      class="fixed top-8 right-8 text-white cursor-pointer"
    />
  </div>
</template>

<style scoped>
.sidebar-overlay {
  z-index: 999999999;
  @apply fixed top-0 left-0 h-screen w-full bg-black bg-opacity-80;
}

.app-sidebar {
  @apply text-white shadow-xl;
}
</style>
