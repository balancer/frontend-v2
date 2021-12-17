<script setup lang="ts">
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import PoolCreateTokenRow from '@/beethovenx/components/pages/pool-create/PoolCreateTokenRow.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists from '@/composables/useTokenLists';
import useTokens from '@/composables/useTokens';
import { computed } from 'vue';
import { getAddress } from '@ethersproject/address';
import LbpTokenWeightsConfig from '@/beethovenx/lbp/components/LbpTokenWeightsConfig.vue';
import { isGreaterThanOrEqualTo } from '@/beethovenx/utils/validations';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';

const {
  data,
  tokenRequiresApproval,
  collateralTokenRequiresApproval
} = useLgeCreateState();
const { getToken } = useTokens();

const launchToken = computed(() => getToken(data.value.tokenContractAddress));
const collateralToken = computed(() =>
  getToken(data.value.collateralTokenAddress)
);

const { appNetworkConfig } = useWeb3();
const { tokenListsLoaded } = useTokenLists();

const allowedCollateralTokens = computed(() => [
  getAddress(appNetworkConfig.addresses.weth),
  getAddress(appNetworkConfig.addresses.usdc)
]);

const tokensLoaded = computed(() => {
  return tokenListsLoaded.value;
});
</script>

<template>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Pool Name</div>
      <div class="text-xl">{{ data.poolName }}</div>
    </div>
    <div>
      <div class="text-gray-500">Pool Symbol</div>
      <div class="text-xl">BPT-{{ data.poolSymbol }}</div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Start Date & Time</div>
      <div class="text-xl">{{ data.startDate }} {{ data.startTime }} UTC</div>
    </div>
    <div>
      <div class="text-gray-500">End Date & Time</div>
      <div class="text-xl">{{ data.endDate }} {{ data.endTime }} UTC</div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Trading Fee</div>
      <div class="text-xl">{{ data.swapFeePercentage }}%</div>
    </div>
    <div>
      <div class="text-gray-500">Platform Fee</div>
      <div class="text-xl">2%</div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Fair Launch Token</div>
      <div class="text-xl items-center flex">
        <span class="mr-2">{{ data.tokenAmount }}</span>
        <span class="mr-1">{{ launchToken.symbol }}</span>
        <BalAsset :address="launchToken.address" :iconURI="data.tokenIconUrl" />
      </div>
    </div>
    <div>
      <div class="text-gray-500">Collateral Token</div>
      <div class="text-xl items-center flex">
        <span class="mr-2">{{ data.collateralAmount }}</span>
        <span class="mr-1">{{ collateralToken.symbol }}</span>
        <BalAsset :address="collateralToken.address" />
      </div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Start Weights</div>
      <div class="text-xl items-center flex">
        <span class="mr-1">{{ data.tokenStartWeight }}%</span>
        <BalAsset :address="launchToken.address" :iconURI="data.tokenIconUrl" />
        <span class="mx-2">/</span>
        <span class="mr-1">{{ data.collateralStartWeight }}%</span>
        <BalAsset :address="collateralToken.address" />
      </div>
    </div>
    <div>
      <div class="text-gray-500">End Weights</div>
      <div class="text-xl items-center flex">
        <span class="mr-1">{{ data.tokenEndWeight }}%</span>
        <BalAsset :address="launchToken.address" :iconURI="data.tokenIconUrl" />
        <span class="mx-2">/</span>
        <span class="mr-1">{{ data.collateralEndWeight }}%</span>
        <BalAsset :address="collateralToken.address" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lbp-review-row {
  @apply grid grid-cols-2 md:grid-cols-2 gap-y-8 gap-x-4 mb-4;
}
</style>
