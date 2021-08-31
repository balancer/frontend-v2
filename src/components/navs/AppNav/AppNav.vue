<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <nav id="app-nav" ref="appNav" class="h-20 px-4 lg:px-6 sticky top-0">
    <div class="h-full flex items-center justify-between">
      <div class="w-2/3 lg:w-1/3 flex items-center">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon v-if="['xs', 'sm', 'md'].includes(bp)" />
          <AppLogo v-else />
        </router-link>
        <AppNavNetworkSelect v-if="!hideNetworkSelect" />
        <DarkModeToggle v-if="!upToLargeBreakpoint" class="ml-2" />
      </div>

      <div
        v-if="!upToLargeBreakpoint"
        class="flex-1 md:w-1/3 flex justify-center"
      >
        <AppNavToggle />
      </div>

      <div class="w-1/3 flex justify-end">
        <AppNavActions />
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppLogo from '@/components/images/AppLogo.vue';
import AppIcon from '@/components/images/AppIcon.vue';
import AppNavAlert from './AppNavAlert.vue';
import AppNavToggle from './AppNavToggle.vue';
import AppNavActions from './AppNavActions.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import useAlerts from '@/composables/useAlerts';

export default defineComponent({
  components: {
    AppLogo,
    AppIcon,
    AppNavAlert,
    AppNavToggle,
    AppNavActions,
    AppNavNetworkSelect,
    DarkModeToggle
  },

  setup() {
    // COMPOSABLES
    const { bp, upToLargeBreakpoint } = useBreakpoints();
    const { trackGoal, Goals } = useFathom();
    const { connector } = useWeb3();
    const { currentAlert } = useAlerts();

    // DATA
    const appNav = ref(null);

    // COMPUTED
    const hideNetworkSelect = computed(() => connector.value?.id === 'gnosis');

    // METHODS
    function handleScroll() {
      if (window.scrollY === 0) {
        appNav.value.classList.remove('shadow-lg');
      } else {
        appNav.value.classList.add('shadow-lg');
      }
    }

    // CALLBACKS
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      // data
      appNav,
      // computed
      bp,
      currentAlert,
      upToLargeBreakpoint,
      hideNetworkSelect,
      // methods
      trackGoal,
      Goals
    };
  }
});
</script>

<style scoped>
#app-nav {
  @apply w-full z-20;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent;
  transition: all 0.2s ease-in-out;
}
</style>
