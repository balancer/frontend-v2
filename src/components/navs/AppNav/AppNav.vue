<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <nav id="app-nav" ref="appNav" class="h-12 pr-3 xl:pr-6 sticky top-0">
    <div class="h-full flex items-center">
      <div class="flex items-center">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon />
        </router-link>
      </div>
      <AppNavToggle v-if="!upToMediumBreakpoint" />
      <AppNavOtherItems v-if="!upToMediumBreakpoint" />

      <div class="flex-1 flex justify-end">
        <AppNavActions />
      </div>
    </div>
  </nav>
  <AppNavBelow />
</template>

<script>
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppIcon from '@/components/images/AppIcon.vue';
import AppNavAlert from './AppNavAlert.vue';
import AppNavToggle from './AppNavToggle.vue';
import AppNavOtherItems from './AppNavOtherItems.vue';
import AppNavActions from './AppNavActions.vue';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import useAlerts from '@/composables/useAlerts';
import AppNavBelow from './AppNavBelow.vue';

export default defineComponent({
  components: {
    AppNavBelow,
    AppIcon,
    AppNavAlert,
    AppNavToggle,
    AppNavActions,
    AppNavOtherItems
  },

  setup() {
    // COMPOSABLES
    const { upToMediumBreakpoint } = useBreakpoints();
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
      upToMediumBreakpoint,
      currentAlert,
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
