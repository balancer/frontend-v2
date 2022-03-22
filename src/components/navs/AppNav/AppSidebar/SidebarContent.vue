<script lang="ts" setup>
import AppLogo from '@/components/images/AppLogo.vue';
</script>

<template>
  <div>
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

    <div class="grid grid-col-1 text-sm mt-8">
      <span class="text-gray-500 px-4 font-medium">Ecosystem</span>
      <BalLink
        href="https://medium.com/balancer-protocol"
        class="side-bar-link flex items-center"
        external
        noStyle
      >
        Blog
        <BalIcon name="arrow-up-right" class="ml-2 text-gray-500" />
      </BalLink>
    </div>
  </div>
</template>

<style scoped>
.side-bar-link {
  @apply transition duration-300 p-4 py-2 hover:bg-gray-850 cursor-pointer;
}
</style>
