<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        color="transparent"
        flat
        class="text-base mr-2"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <img
          src="~@/beethovenx/assets/images/beets-icon-large.png"
          width="28"
          class="mr-2"
          v-if="upToLargeBreakpoint ? !loading : true"
        />
        <BalLoadingIcon size="sm" v-if="loading" />
        <span class="hidden lg:block" v-else>
          {{ fNum(beetsPrice, 'usd') }}
        </span>
      </BalBtn>
    </template>
    <div class="w-64 sm:w-96">
      <h5 class="text-lg mb-3 px-3 pt-3">
        Beethoven X
      </h5>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2 px-2 mb-2">
        <BalCard>
          <div class="text-sm text-gray-500 font-medium mb-2 text-left">
            TVL
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            ${{ fNum(tvl, 'usd_lg') }}
          </div>
        </BalCard>
        <BalCard>
          <div class="text-sm text-gray-500 font-medium mb-2 text-left">
            BEETS Price
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            ${{ fNum(beetsPrice, 'token_fixed') }}
          </div>
        </BalCard>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2 px-2 mb-2">
        <BalCard>
          <div class="text-sm text-gray-500 font-medium mb-2 text-left">
            Market Cap
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            ${{ fNum(marketCap, 'usd_lg') }}
          </div>
        </BalCard>
        <BalCard>
          <div class="text-sm text-gray-500 font-medium mb-2 text-left">
            Circulating Supply
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            {{ fNum(circulatingSupply, 'token_lg') }}
          </div>
        </BalCard>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { sumBy } from 'lodash';
import numeral from 'numeral';
import usePools from '@/composables/pools/usePools';
import useEthers from '@/composables/useEthers';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import { Alert } from '@/composables/useAlerts';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';

export default defineComponent({
  name: 'AppNavBeets',

  props: {
    alert: { type: Object as PropType<Alert>, required: true }
  },

  setup() {
    const { fNum } = useNumbers();
    const { upToLargeBreakpoint } = useBreakpoints();

    const protocolDataQuery = useProtocolDataQuery();
    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    const beetsPrice = computed(
      () => protocolDataQuery.data?.value?.beetsPrice || 0
    );
    const circulatingSupply = computed(
      () => protocolDataQuery.data.value?.circulatingSupply || 0
    );
    const marketCap = computed(() => {
      return beetsPrice.value * circulatingSupply.value;
    });
    const loading = computed(() => protocolDataQuery.isLoading.value);

    return {
      fNum,
      upToLargeBreakpoint,
      beetsPrice,
      tvl,
      circulatingSupply,
      marketCap,
      loading
    };
  }
});
</script>

<style>
.app-nav-alert {
  @apply flex items-center justify-between py-4 px-6;
}
</style>
