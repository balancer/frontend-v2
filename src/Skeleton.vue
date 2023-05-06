<script lang="ts" setup>
import { useRoute } from 'vue-router';

const DefaultLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/DefaultLayout.vue')
);
const BlankLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/BlankLayout.vue')
);
const FocussedLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/FocussedLayout.vue')
);
const ContentLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/ContentLayout.vue')
);

const JoinExitLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/JoinExitLayout.vue')
);

const GlobalModalContainer = defineAsyncComponent(
  () => import('@/components/modals/GlobalModalContainer.vue')
);

// Once the skeleton has been loaded, we load the rest of the App that contains heavy dependencies
const Common = defineAsyncComponent(() => import('./Common.vue'));

import useBackgroundColor from './composables/useBackgroundColor';
import { useContentLoadStates } from './composables/useContentLoadStates';

/**
 * STATE
 */
const layout = ref('DefaultLayout');

const Layouts = {
  BlankLayout: BlankLayout,
  DefaultLayout: DefaultLayout,
  ContentLayout: ContentLayout,
  FocussedLayout: FocussedLayout,
  JoinExitLayout: JoinExitLayout,
};

/**
 * COMPOSABLES
 */
const route = useRoute();
const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
const { isGlobalProviderLoaded } = useContentLoadStates();

/**
 * WATCHERS
 */
watch(route, newRoute => {
  updateBgColorFor(newRoute);
  if (newRoute.meta.layout) {
    layout.value = newRoute.meta.layout as string;
  } else {
    layout.value = 'DefaultLayout';
  }
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="Layouts[layout]" />
    <Common v-if="isGlobalProviderLoaded"></Common>
  </div>
  <GlobalModalContainer v-if="isGlobalProviderLoaded" />
</template>
