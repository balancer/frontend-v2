<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div>
      <div class="px-4 lg:px-0">
        <h3 class="mb-6">Create a Fair Launch Auction</h3>
      </div>
    </div>
    <StepContainer
      :complete="projectDetailsSaved"
      title="Enter Your Project Details"
      step-number="1"
    >
      <template v-slot:content>
        <div v-if="!projectDetailsSaved">
          <LbpProjectDetailInputs />
          <BalBtn
            @click="saveProjectDetails()"
            :disabled="!projectDetailsValid"
            size="md"
            :block="true"
            class="mt-8 mb-2"
            :loading="loadingToken"
            loading-label="Loading token..."
          >
            Save Project Details
          </BalBtn>
        </div>
        <LbpProjectDetailReview v-else />
      </template>
      <template v-slot:right v-if="projectDetailsSaved">
        <BalBtn
          v-if="poolId === null"
          @click="editProjectDetails()"
          size="sm"
          :disabled="creatingAuction"
        >
          <div class="px-4">
            Edit
          </div>
        </BalBtn>
      </template>
    </StepContainer>
    <StepContainer
      :complete="auctionConfigSaved"
      title="Configure Your Auction"
      step-number="2"
    >
      <template v-slot:content v-if="auctionConfigOpen || auctionConfigSaved">
        <div v-if="auctionConfigOpen">
          <LbpAuctionConfigurationInputs />
          <LbpPreviewChart />

          <BalBtn
            @click="saveAuctionConfig()"
            :disabled="!auctionConfigValid"
            size="md"
            :block="true"
            class="mt-8 mb-2"
          >
            Save Auction Configuration
          </BalBtn>
        </div>
        <div v-else>
          <LbpAuctionConfigurationReview />
        </div>
      </template>
      <template v-slot:right v-if="auctionConfigSaved">
        <BalBtn
          v-if="poolId === null"
          @click="editAuctionConfig()"
          size="sm"
          :disabled="!projectDetailsSaved || creatingAuction"
        >
          <div class="px-4">
            Edit
          </div>
        </BalBtn>
      </template>
    </StepContainer>
    <StepContainer
      :complete="poolId !== null"
      title="Create Your Fair Launch Auction"
      step-number="3"
    >
      <template v-slot:content v-if="reviewAndDeployOpen">
        <LbpCreateActions />
      </template>
    </StepContainer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import useNumbers from '@/composables/useNumbers';
import StepContainer from '@/beethovenx/components/containers/StepContainer.vue';
import useTokenLists from '@/composables/useTokenLists';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useLbpState from '@/beethovenx/lbp/composables/useLbpState';
import LbpProjectDetailInputs from '@/beethovenx/lbp/components/LbpProjectDetailInputs.vue';
import LbpAuctionConfigurationInputs from '@/beethovenx/lbp/components/LbpAuctionConfigurationInputs.vue';
import LbpPreviewChart from '@/beethovenx/lbp/components/LbpPreviewChart.vue';
import LbpCreateActions from '@/beethovenx/lbp/components/LbpCreateActions.vue';
import LbpProjectDetailReview from '@/beethovenx/lbp/components/LbpProjectDetailReview.vue';
import LbpAuctionConfigurationReview from '@/beethovenx/lbp/components/LbpAuctionConfigurationReview.vue';

export default defineComponent({
  components: {
    LbpAuctionConfigurationReview,
    LbpProjectDetailReview,
    LbpCreateActions,
    LbpPreviewChart,
    LbpAuctionConfigurationInputs,
    LbpProjectDetailInputs,
    StepContainer,
    BalBtn
  },

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
      creatingAuction
    };
  }
});
</script>
<style scoped>
.lbp-input-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8;
}
</style>
