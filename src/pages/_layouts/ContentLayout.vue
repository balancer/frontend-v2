<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/components/navs/AppNav/AppNav.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
</script>

<template>
  <AppNav />
  <section class="dark:bg-gray-900 lg:py-8">
    <div class="content-container">
      <router-view />
    </div>
  </section>
</template>

<style scoped>
h2,
h3,
p,
ul,
ol,
em {
  @apply pb-3;
}
.content-container {
  @apply w-full max-w-4xl px-4 md:p-8 lg:p-12 mx-auto py-8 bg-white dark:bg-gray-900;
  min-height: calc(100vh - 140px);
}
.subsection {
  @apply mb-8;
}

h1,
h2,
h3 {
  @apply font-body tracking-tight;
  font-variation-settings: 'wght' 500;
}

h3 {
  @apply font-body tracking-tight;
  font-variation-settings: 'wght' 600;
}

li {
  @apply list-disc ml-8 pb-2;
}

ol > li {
  @apply list-decimal;
}

em {
  font-style: italic;
  font-variation-settings: 'ital' 1;
  font-synthesis: none;
}
</style>
