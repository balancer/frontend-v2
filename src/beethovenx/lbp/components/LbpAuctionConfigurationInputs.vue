<script setup lang="ts">
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import PoolCreateTokenRow from '@/beethovenx/components/pages/pool-create/PoolCreateTokenRow.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists from '@/composables/useTokenLists';
import { computed } from 'vue';
import { getAddress } from '@ethersproject/address';
import LbpTokenWeightsConfig from '@/beethovenx/lbp/components/LbpTokenWeightsConfig.vue';
import { isGreaterThanOrEqualTo } from '@/beethovenx/utils/validations';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';

const {
  data,
  tokenRequiresApproval,
  collateralTokenRequiresApproval,
  lgeChartConfigValid
} = useLgeCreateState();
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
  <div class="lbp-input-row">
    <BalTextInput
      title="Pool Name"
      v-model="data.poolName"
      type="text"
      tooltip="The name that will appear on ftmscan.com and the invest screen."
    />
    <BalTextInput
      title="Pool Symbol"
      v-model="data.poolSymbol"
      type="text"
      validate-on="input"
      tooltip="The token symbol for your BPT."
      @update:modelValue="
        () => (data.poolSymbol = data.poolSymbol.toUpperCase().slice(0, 7))
      "
    >
      <template v-slot:prepend>
        <div class="flex items-center h-full ml-2 mr-2 text-gray-500">
          BPT-
        </div>
      </template>
    </BalTextInput>
  </div>
  <div class="lbp-input-row">
    <BalTextInput
      title="Start Date (YYYY-MM-DD)"
      v-model="data.startDate"
      type="text"
      placeholder="YYYY-MM-DD"
    />
    <BalTextInput
      title="Start Time (UTC)"
      tooltip="The start time in UTC. Must be in 24 hour time format. ie: 23:30 = 11:30 PM"
      v-model="data.startTime"
      type="text"
      validate-on="input"
      prepend-border
      :no-margin="true"
      placeholder="HH:mm"
    />
  </div>
  <div class="lbp-input-row">
    <BalTextInput
      title="End Date (YYYY-MM-DD)"
      v-model="data.endDate"
      type="text"
      validate-on="input"
      prepend-border
      :no-margin="true"
      placeholder="YYYY-MM-DD"
    />
    <BalTextInput
      title="End Time (UTC)"
      tooltip="The end time in UTC. Must be in 24 hour time format. ie: 23:30 = 11:30 PM"
      v-model="data.endTime"
      type="text"
      validate-on="input"
      prepend-border
      :no-margin="true"
      placeholder="HH:mm"
    />
  </div>
  <div class="mb-8">
    <BalTextInput
      title="Trading Fee"
      v-model="data.swapFeePercentage"
      type="number"
      validate-on="input"
      prepend-border
      :no-margin="true"
      :rules="[isGreaterThanOrEqualTo(0.0001), isLessThanOrEqualTo(10)]"
      tooltip="Ex: 2.5 = 2.5%. The swap fee percentage must be between 0.0001% and 10%"
    />
  </div>
  <div>Platform Fee</div>
  <div class="mt-1 text-lg mb-4">
    2% Platform Fee - Deducted by Beethoven X from the total funds raised at the
    end of the auction.
  </div>
  <div class="border-purple-500 border-2 rounded-lg px-4 py-4 mb-8">
    <div>
      <p class="mb-3">
        The trading fee is earned by your project on transacted volume during
        the auction and serves the dual purpose of discouraging price
        manipulation by large buy orders while also offsetting the platform fee
        shared with Beethoven X.
      </p>
      <p class="mb-3">
        The 2% platform fee is applied by Beethoven X at the conclusion of an
        auction on total funds raised. Total funds raised is inclusive of funds
        raised + volume fee (aka swap fee).
      </p>
      <p class="mb-3">
        Ex: Project raises $600,000 and has $1,000,000 of volume. If the trading
        fee is 3% the project earns $30,000 in trading fees, while sharing
        $20,600 (2%) with Beethoven X from total funds raised at auction end.
      </p>
      <a
        href="https://docs.beethovenx.io/balancer-v2-1/lbps-for-token-launches"
        target="_blank"
        class="text-green-500"
      >
        More Info
      </a>
    </div>
  </div>
  <div class="lbp-input-row" v-if="tokensLoaded">
    <PoolCreateTokenRow
      title="Fair Launch Token"
      :token-address-input="data.tokenContractAddress"
      :token-amount-input="data.tokenAmount"
      :token-weight-input="0"
      @token-delete="() => {}"
      @token-address-change="value => {}"
      @token-amount-change="
        value => {
          data.tokenAmount = value;
        }
      "
      @token-weight-change="value => {}"
      @token-approved="
        () => {
          tokenRequiresApproval = false;
        }
      "
      @requires-approval="
        () => {
          tokenRequiresApproval = true;
        }
      "
      :can-delete="false"
      :has-token-weight="false"
      :hide-delete="true"
      :allowed-tokens="[data.tokenContractAddress]"
      :token-icon-url="data.tokenIconUrl"
      :spender-address="appNetworkConfig.addresses.copperProxy"
    />
    <PoolCreateTokenRow
      title="Collateral Token"
      :token-address-input="data.collateralTokenAddress"
      :token-amount-input="data.collateralAmount"
      :token-weight-input="0"
      @token-delete="() => {}"
      @token-address-change="
        value => {
          data.collateralTokenAddress = value;
        }
      "
      @token-amount-change="
        value => {
          data.collateralAmount = value;
        }
      "
      @token-weight-change="value => {}"
      @token-approved="
        () => {
          collateralTokenRequiresApproval = false;
        }
      "
      @requires-approval="
        () => {
          collateralTokenRequiresApproval = true;
        }
      "
      :can-delete="false"
      :has-token-weight="false"
      :hide-delete="true"
      :allowed-tokens="allowedCollateralTokens"
      :spender-address="appNetworkConfig.addresses.copperProxy"
    />
  </div>
  <LbpTokenWeightsConfig />
</template>

<style scoped>
.lbp-input-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8;
}
</style>
