<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
</script>

<template>
  <div>
    <div class="app-body">
      <AppNav />
      <div class="pb-16">
        <router-view :key="$route.path" />
      </div>
      <BalBtn
        v-if="isDesktop"
        id="intercom-activator"
        circle
        size="lg"
        color="blue"
        class="fixed bottom-0 right-0 m-4 z-100"
      >
        <BalIcon name="message-square" size="lg" />
      </BalBtn>
    </div>
    <Footer />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  @apply mb-8;
  min-height: calc(100vh - 2rem);
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
