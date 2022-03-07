<script setup lang="ts">
import AppNav from '@/components/navs/AppNav/AppNav.vue';
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
.content-container {
  @apply w-full max-w-4xl px-4 md:p-8 lg:p-12 mx-auto py-8 bg-white dark:bg-gray-900;
  min-height: calc(100vh - 140px);
}

.content-container :deep(h1) {
  @apply pb-6;
}

.content-container :deep(h2),
.content-container :deep(h3),
.content-container :deep(p),
.content-container :deep(ul),
.content-container :deep(ol),
.content-container :deep(em) {
  @apply pb-3;
}

.content-container :deep(.subsection) {
  @apply mb-8;
}

.content-container :deep(h1),
.content-container :deep(h2),
.content-container :deep(h3) {
  @apply font-body tracking-tight;
  font-variation-settings: 'wght' 500;
}

.content-container :deep(h3) {
  @apply font-body tracking-tight;
  font-variation-settings: 'wght' 600;
}

.content-container :deep(li) {
  @apply list-disc ml-8 pb-2;
}

.content-container :deep(ol > li) {
  @apply list-decimal;
}

.content-container :deep(em) {
  font-style: italic;
  font-variation-settings: 'ital' 1;
  font-synthesis: none;
}

.content-container :deep(em.font-medium) {
  font-variation-settings: 'ital' 1, 'wght' 500;
}

.content-container :deep(table),
.content-container :deep(th),
.content-container :deep(td) {
  @apply p-4 border-gray-500 border text-left align-top;
}

.content-container :deep(table) {
  @apply mt-4 mb-8;
}
</style>
