<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';

onMounted(() => {
  document.documentElement.classList.add('scroll-smooth');
});

onUnmounted(() => {
  document.documentElement.classList.remove('scroll-smooth');
});
</script>

<template>
  <AppNav />
  <section class="lg:py-8 dark:bg-gray-900">
    <div class="content-container">
      <router-view v-slot="{ Component }" :key="$route.path">
        <transition appear name="appear">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </section>
  <Footer />
</template>

<style scoped>
.content-container {
  @apply w-full max-w-4xl px-4 md:p-8 lg:p-12 mx-auto py-8 bg-white dark:bg-gray-900 transition-all;

  min-height: calc(100vh - 140px);
  scroll-behavior: smooth !important;
  scroll-margin-top: 5em;
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
  @apply pb-4;
}

.content-container :deep(h4),
.content-container :deep(h5),
.content-container :deep(h6) {
  @apply pb-2;
}

.content-container :deep(.subsection) {
  @apply mb-8;
}

.content-container :deep(h1),
.content-container :deep(h2),
.content-container :deep(h3),
.content-container :deep(h4) {
  @apply font-body tracking-tight;

  font-variation-settings: 'wght' 700;
}

.content-container :deep(h5) {
  @apply font-body tracking-tight;
}

.content-container :deep(li) {
  @apply list-disc ml-8 pb-2;
}

.content-container :deep(ol > li) {
  @apply list-decimal;
}

.content-container :deep(.nav li > ul) {
  padding-top: 0.375rem;
}

.content-container :deep(li > ul) {
  padding-top: 0;
  padding-bottom: 0;
}

.content-container :deep(.nav ul) {
  padding-bottom: 0;
}

.content-container :deep(li),
.content-container :deep(p) {
  @apply text-gray-700 dark:text-gray-300;
}

.content-container :deep(em) {
  font-style: italic;
  font-variation-settings: 'ital' 1;
  font-synthesis: none;
}

.content-container :deep(.link) {
  font-variation-settings: 'wght' 500;
}

.content-container :deep(em.font-medium) {
  font-variation-settings: 'ital' 1, 'wght' 500;
}

.content-container :deep(em.font-semibold) {
  font-variation-settings: 'ital' 1, 'wght' 600;
}

.content-container :deep(table),
.content-container :deep(th),
.content-container :deep(td) {
  @apply p-4 border-gray-500 border text-left align-top;
}

.content-container :deep(table) {
  @apply mt-4 mb-8;
}

.content-container :deep(hr) {
  @apply border-t border-gray-200 dark:border-gray-600 pb-12;
}
</style>
