<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppLogo from '@/components/images/AppLogo.vue';
import AppIcon from '@/components/images/AppIcon.vue';
import AppNavAlert from './AppNavAlert.vue';
import AppNavActions from './AppNavActions.vue';
import useFathom from '@/composables/useFathom';
import useAlerts from '@/composables/useAlerts';
import DesktopLinks from './DesktopLinks/DesktopLinks.vue';

/**
 * STATE
 */
const appNav = ref<HTMLDivElement>();

/**
 * COMPOSABLES
 */
const { bp, isDesktop } = useBreakpoints();
const { trackGoal, Goals } = useFathom();
const { currentAlert } = useAlerts();

/**
 * METHODS
 */
function handleScroll() {
  if (!appNav.value) return;

  if (window.scrollY === 0) {
    appNav.value.classList.remove('shadow-lg');
  } else {
    appNav.value.classList.add('shadow-lg');
  }
}

/**
 * LIFECYCLE
 */
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <nav id="app-nav" ref="appNav" class="h-20 px-4 lg:px-6 sticky top-0">
    <div class="h-full flex items-center justify-between">
      <div class="flex items-center h-full">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon v-if="['xs', 'sm', 'md'].includes(bp)" />
          <AppLogo v-else />
        </router-link>

        <DesktopLinks v-if="isDesktop" class="ml-8" />
      </div>

      <AppNavActions />
    </div>
  </nav>
</template>

<style scoped>
#app-nav {
  @apply w-full z-30;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent;
  transition: all 0.2s ease-in-out;
}
</style>
