<template>
  <div class="app-nav-footer">
    <div class="app-nav-footer-container">
      <div class="w-1/3 pl-2">
        <DarkModeToggle circle />
      </div>
      <div class="w-1/3 flex justify-center">
        <AppNavToggle darkModeBg="700" />
      </div>
      <div class="w-1/3 flex justify-end pr-2">
        <IntercomToggle circle />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppNavToggle from '@/components/navs/AppNav/AppNavToggle.vue';
import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import IntercomToggle from '@/components/btns/IntercomToggle.vue';

export default defineComponent({
  name: 'AppFooterNav',

  components: {
    AppNavToggle,
    DarkModeToggle,
    IntercomToggle
  }
});
</script>

<style scoped>
.app-nav-footer {
  @apply fixed bottom-0 left-0 w-full px-2 mb-4 z-20;
}

.app-nav-footer-container {
  @apply w-full py-2 mx-auto rounded-full max-w-lg;
  @apply bg-white dark:bg-gray-800 shadow-xl;
  @apply flex justify-between items-center;
}
</style>
