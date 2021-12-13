<script setup lang="ts">
import useLbpState from '@/beethovenx/lbp/composables/useLbpState';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import PoolCreateTokenRow from '@/beethovenx/components/pages/pool-create/PoolCreateTokenRow.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenLists from '@/composables/useTokenLists';
import useTokens from '@/composables/useTokens';
import { computed } from 'vue';
import { getAddress } from '@ethersproject/address';
import LbpTokenWeightsConfig from '@/beethovenx/lbp/components/LbpTokenWeightsConfig.vue';
import {
  isGreaterThanOrEqualTo,
  isSymbol,
  maxChar
} from '@/beethovenx/utils/validations';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';

const { data } = useLbpState();
const { appNetworkConfig } = useWeb3();
const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
const { dynamicDataLoaded } = useTokens();

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
      title="Swap Fee Percentage"
      v-model="data.swapFeePercentage"
      type="number"
      validate-on="input"
      prepend-border
      :no-margin="true"
      :rules="[isGreaterThanOrEqualTo(0.0001), isLessThanOrEqualTo(10)]"
      tooltip="Ex: 2.5 = 2.5%. The swap fee percentage must be between 0.0001% and 10%"
    />
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
      @token-approved="address => {}"
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
      @token-approved="address => {}"
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
