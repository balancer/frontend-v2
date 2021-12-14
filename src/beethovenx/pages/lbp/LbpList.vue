<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="flex mb-3 items-center">
      <div class="flex-1">
        <img src="~@/beethovenx/assets/images/auctions.svg" class="-ml-4" />
      </div>
      <BalBtn
        class="hidden lg:block"
        label="Create an Auction"
        @click="goToLaunchCreate"
      />
    </div>
    <LbpAuctionsTable />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import useNumbers from '@/composables/useNumbers';
import useTokenLists from '@/composables/useTokenLists';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useLbpState from '@/beethovenx/lbp/composables/useLbpState';
import LbpAuctionsTable from '@/beethovenx/lbp/components/LbpAuctionsTable.vue';

export default defineComponent({
  components: { LbpAuctionsTable },

  setup() {
    // COMPOSABLES
    const router = useRouter();

    const { isWalletReady, appNetworkConfig } = useWeb3();
    const { txListener } = useEthers();
    const { fNum } = useNumbers();
    const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
    const { dynamicDataLoaded } = useTokens();
    const {
      data,
      projectDetailsSaved,
      projectDetailsValid,
      saveProjectDetails,
      editProjectDetails,
      auctionConfigOpen,
      loadingToken,
      auctionConfigValid,
      saveAuctionConfig,
      auctionConfigSaved,
      editAuctionConfig,
      reviewAndDeployOpen,
      poolId,
      creatingAuction
    } = useLbpState();

    const allowedCollateralTokens = computed(() => [
      getAddress(appNetworkConfig.addresses.weth),
      getAddress(appNetworkConfig.addresses.usdc)
    ]);

    const tokensLoaded = computed(() => {
      return tokenListsLoaded.value;
    });

    function goToLaunchCreate() {
      router.push({ name: 'auction-create' });
    }

    return {
      // data

      // computed
      isWalletReady,

      //methods
      router,
      // constants
      EXTERNAL_LINKS,
      fNum,
      tokenListsLoaded,
      dynamicDataLoaded,
      allowedCollateralTokens,
      tokensLoaded,
      data,
      saveProjectDetails,
      editProjectDetails,
      projectDetailsSaved,
      projectDetailsValid,
      auctionConfigOpen,
      loadingToken,
      auctionConfigValid,
      saveAuctionConfig,
      auctionConfigSaved,
      editAuctionConfig,
      reviewAndDeployOpen,
      poolId,
      creatingAuction,
      goToLaunchCreate
    };
  }
});
</script>
<style scoped>
.lbp-input-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8;
}
</style>
