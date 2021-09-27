<template>
  <BalCard noPad :hFull="upToLargeBreakpoint" noShadow>
    <div class="flex flex-col bg-white w-full">
      <div class="flex justify-between p-3 shadow-lg">
        <h6>My Wallet</h6>
        <div>{{ etherBalance }} ETH</div>
      </div>
      <div class="p-3">
        <BalAssetSet
          @click="setTokenInAddress"
          :width="230"
          wrap
          :size="32"
          :addresses="tokensWithBalance"
        ></BalAssetSet>
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { useTradeState } from '@/composables/trade/useTradeState';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const { balanceFor, balances } = useTokens();
    const { appNetworkConfig } = useWeb3();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { setTokenInAddress } = useTradeState();
    const etherBalance = computed(() =>
      Number(balanceFor(appNetworkConfig.nativeAsset.address)).toFixed(4)
    );

    const tokensWithBalance = computed(() => {
      return Object.keys(balances.value).filter(
        tokenAddress =>
          Number(balances.value[tokenAddress]) > 0 &&
          tokenAddress !== appNetworkConfig.nativeAsset.address
      );
    });

    return {
      etherBalance,
      tokensWithBalance,
      upToLargeBreakpoint,
      setTokenInAddress,
    };
  }
});
</script>
