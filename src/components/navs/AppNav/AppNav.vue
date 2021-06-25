<template>
  <AppNavAlert v-if="alert" :alert="alert" />
  <nav
    id="app-nav"
    ref="appNav"
    class="h-20 px-4 lg:px-6 bg-white sticky top-0"
  >
    <div class="h-full flex items-center justify-between">
      <div class="w-1/3 flex items-center">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon v-if="['xs', 'sm', 'md'].includes(bp)" />
          <AppLogo v-else />
        </router-link>
        <AppNavNetworkSelect />
      </div>

      <div class="flex-1 md:w-1/3 flex justify-center">
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
import { useStore } from 'vuex';
import useBreakpoints from '@/composables/useBreakpoints';
import AppLogo from '@/components/images/AppLogo.vue';
import AppIcon from '@/components/images/AppIcon.vue';
import AppNavAlert from './AppNavAlert.vue';
import AppNavToggle from './AppNavToggle.vue';
import AppNavActions from './AppNavActions.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import useFathom from '@/composables/useFathom';

export default defineComponent({
  components: {
    AppLogo,
    AppIcon,
    AppNavAlert,
    AppNavToggle,
    AppNavActions,
    AppNavNetworkSelect
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { trackGoal, Goals } = useFathom();

    // DATA
    const appNav = ref(null);

    // COMPUTED
    const alert = computed(() => store.state.alerts.current);

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
      alert,
      // methods
      trackGoal,
      Goals
    };
  }
});
</script>

<style scoped>
#app-nav {
  @apply w-full;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent dark:border-gray-700;
  transition: all 0.2s ease-in-out;
  z-index: 99999999;
}
</style>
