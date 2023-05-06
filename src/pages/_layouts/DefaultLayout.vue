<script setup lang="ts">
// import { AppNav, Footer } from './async-layout-components';
import { Footer } from './async-layout-components';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import { useContentLoadStates } from '@/composables/useContentLoadStates';
import { sleep } from '@/lib/utils';

const { isFirstContentPainted } = useContentLoadStates();
const showPage = ref(false);
onBeforeMount(async () => {
  if (!isFirstContentPainted.value) await sleep(200);
  showPage.value = true;
});
</script>

<template>
  <div>
    <div class="app-body">
      <AppNav />
      <div class="pb-16">
        <router-view v-slot="{ Component }" :key="$route.path">
          <transition appear name="appear">
            <component :is="Component" v-if="showPage" />
          </transition>
        </router-view>
      </div>
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
</style>
