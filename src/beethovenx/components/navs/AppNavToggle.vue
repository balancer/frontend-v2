<template>
  <div :class="`app-nav-toggle`">
    <router-link
      :to="{ name: 'trade' }"
      :class="['toggle-link px-5', { [activeClasses]: isTradePage }]"
      @click="trackGoal(Goals.ClickNavTrade)"
    >
      Swap
    </router-link>
    <router-link
      :to="{ name: 'pools' }"
      :class="['toggle-link px-5', { [activeClasses]: isInvestPage }]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      Invest{{ upToXLargeBreakpoint ? '' : '&nbsp;/&nbsp;Farm' }}
    </router-link>
    <router-link
      :to="{ name: 'stake' }"
      :class="['toggle-link px-5', { [activeClasses]: isStakePage }]"
    >
      Stake
    </router-link>
    <router-link
      :to="{ name: 'launch' }"
      :class="['toggle-link px-5', { [activeClasses]: isLaunchPage }]"
    >
      Launch
    </router-link>
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  name: 'AppNavToggle',
  components: {},
  props: {
    darkModeBg: { type: String, default: '800' }
  },

  setup() {
    const route = useRoute();
    const { appLoading } = useApp();
    const { account } = useWeb3();
    const { upToXLargeBreakpoint } = useBreakpoints();
    const activeClasses = 'bg-black text-green-500 dark:bg-gray-800';
    const isTradePage = computed(() => route.name === 'trade');
    const isPortfolioPage = computed(() => route.name === 'my-portfolio');
    const isStakePage = computed(() => route.name === 'stake');
    const isLaunchPage = computed(
      () =>
        route.name === 'launch' ||
        route.name === 'lge-create' ||
        route.name === 'lge'
    );
    const isInvestPage = computed(
      () => route.name === 'invest' || String(route.name).startsWith('pool')
    );

    const { trackGoal, Goals } = useFathom();

    const isLoggedIn = computed(() => !appLoading.value && !!account.value);

    return {
      isTradePage,
      activeClasses,
      trackGoal,
      Goals,
      isLoggedIn,
      isPortfolioPage,
      isStakePage,
      isInvestPage,
      isLaunchPage,
      upToXLargeBreakpoint
    };
  }
});
</script>

<style scoped>
.app-nav-toggle {
  @apply h-12 flex items-center;
  font-variation-settings: 'wght' 600;
}

.toggle-link {
  @apply h-full flex items-center text-center;
}
</style>
