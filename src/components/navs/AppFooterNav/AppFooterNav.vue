<template>
  <div class="app-nav-footer">
    <div class="app-nav-footer-container">
      <AppNavToggle />
      <AppNavOtherItems verticalAlign="bottom" align="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppNavToggle from '@/beethovenx/components/navs/AppNavToggle.vue';
import AppNavOtherItems from '@/beethovenx/components/navs/AppNavOtherItems.vue';

export default defineComponent({
  name: 'AppFooterNav',

  components: {
    AppNavToggle,
    AppNavOtherItems
  }
});
</script>

<style scoped>
.app-nav-footer {
  @apply fixed bottom-0 left-0 w-full z-20;
}

.app-nav-footer-container {
  @apply w-full;
  @apply bg-white dark:bg-gray-900;
  @apply flex justify-center items-center;

  /* @apply w-full z-50;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent;
  transition: all 0.2s ease-in-out; */
}
</style>
