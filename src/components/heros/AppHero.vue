<template>
  <div :class="['app-hero', classes]">
    <div class="w-full sm:w-3/4 md:w-1/2">
      <template v-if="isConnected">
        <h1 class="text-lg font-normal text-gray-500 font-body mb-2">
          My Balancer investments
        </h1>
        <BalLoadingBlock v-if="calculating" class="h-10 w-40 mx-auto" />
        <span v-else class="text-3xl font-bold">
          {{ fNum(totalInvested, 'usd', null, true) }}
        </span>
      </template>
      <template v-else>
        <h1 class="text-white text-bold text-center">
          An automated portfolio manager and trading platform.
        </h1>
        <div class="flex justify-center mt-4">
          <BalBtn color="white" class="mr-4" @click="setAccountModal(true)">
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            href="https://balancer.fi"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
          >
            {{ $t('learnMore') }}
            <BalIcon name="external-link" size="sm" class="ml-2" />
          </BalBtn>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import { useStore } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import useWeb3 from '@/composables/useWeb3';
import { Pool } from '@/api/subgraph';

export default defineComponent({
  name: 'AppHero',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { fNum } = useNumbers();
    const { userNetwork, account, loading: isWeb3Loading } = useWeb3();

    // DATA
    const totalInvested = ref(0);
    const calculating = ref(true);

    // COMPUTED
    const setAccountModal = val => store.commit('web3/setAccountModal', val);
    const prices = computed(() => store.state.market.prices);

    const isConnected = computed(
      () => isAuthenticated.value && !isWeb3Loading.value
    );

    const classes = computed(() => {
      return {
        ['bg-cover h-72 app-hero-bg-image']: !isConnected.value,
        ['bg-white h-40']: isConnected.value
      };
    });

    // METHODS
    function getInvestedValue(pool): number {
      if (!pool.shares) return 0;
      return (pool.liquidity / parseFloat(pool.totalShares)) * pool.shares;
    }

    watch(isConnected, async newVal => {
      if (newVal) {
        const pools: Pool[] = await getPoolsWithShares(
          userNetwork.value.id,
          account.value,
          prices.value
        );
        const investedAmounts = pools.map(pool => getInvestedValue(pool));
        totalInvested.value = investedAmounts.reduce((a, b) => a + b, 0);
        calculating.value = false;
      }
    });

    return {
      // data
      totalInvested,
      calculating,
      // computed
      isConnected,
      classes,
      // methods
      setAccountModal,
      fNum
    };
  }
});
</script>

<style>
.app-hero {
  @apply flex items-center justify-center text-center px-4;
  transition: all 0.3s ease-in-out;
}

.app-hero-bg-image {
  background-image: url('/images/backgrounds/bg-connect-wallet.svg');
}
</style>
