<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <nav id="app-nav" ref="appNav" class="h-12 px-4 lg:px-6 sticky top-0">
    <div class="h-full flex items-center justify-between">
      <div class="flex items-center">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon />
        </router-link>
      </div>

      <div v-if="!upToLargeBreakpoint" class="flex-1 md:w-1/3 flex">
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
import AppIcon from '@/beethovenx/components/images/AppIcon.vue';
import AppNavAlert from '@/components/navs/AppNav/AppNavAlert';
import AppNavToggle from '@/beethovenx/components/navs/AppNavToggle.vue';
import AppNavActions from '@/beethovenx/components/navs/AppNavActions.vue';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import useAlerts from '@/composables/useAlerts';

export default defineComponent({
  components: {
    AppIcon,
    AppNavAlert,
    AppNavToggle,
    AppNavActions
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
  @apply w-full z-50;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent;
  transition: all 0.2s ease-in-out;
}
</style>
