<script setup lang="ts">
import useLbpState from '@/beethovenx/lbp/composables/useLbpState';
import ActionStepContainer from '@/beethovenx/components/containers/ActionStepContainer.vue';
import { TransactionReceipt } from '@ethersproject/providers';
import { computed } from 'vue';
import { PoolCreatorService } from '@/beethovenx/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import useTokens from '@/composables/useTokens';
import { CopperProxyService } from '@/beethovenx/services/pool/copper-proxy.service';

const { appNetworkConfig, getProvider, account } = useWeb3();
const {
  data,
  creatingAuction,
  poolId,
  poolAddress,
  poolTokens,
  fetchingPoolData
} = useLbpState();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { tokens } = useTokens();

const copperProxyService = computed(
  () => new CopperProxyService(appNetworkConfig.key)
);
const poolCreatorService = computed(
  () => new PoolCreatorService(appNetworkConfig.key)
);

async function createAuction(): Promise<void> {
  const { poolName, poolSymbol } = data.value;

  try {
    creatingAuction.value = true;

    const tx = await copperProxyService.value.createAuction(
      getProvider(),
      data.value,
      tokens.value
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'create',
      summary: `Creating your pool with name: ${poolName}`,
      details: { name: poolName, symbol: poolSymbol }
    });

    txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        fetchingPoolData.value = true;
        const data = await poolCreatorService.value.getPoolDataFromTransaction(
          getProvider(),
          receipt
        );

        poolAddress.value = data.poolAddress;
        poolId.value = data.poolId;

        fetchingPoolData.value = false;
        creatingAuction.value = false;
      },
      onTxFailed: () => {
        creatingAuction.value = false;
      }
    });
  } catch (error) {
    console.error(error);
    creatingAuction.value = false;
  }
}
</script>

<template>
  <div class="mb-6">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce fringilla
    ligula feugiat, ultrices lorem eget, pretium mauris. Morbi tempor turpis non
    urna eleifend, ac porta felis placerat. Pellentesque et ante et tellus
    commodo finibus. Donec ac sodales lectus, a porttitor eros. Interdum et
    malesuada fames ac ante ipsum primis in faucibus. Sed vestibulum faucibus
    blandit. Nullam ultrices sem nec cursus convallis. Vivamus in orci id dui
    sagittis fermentum.
  </div>
  <div class="mb-4">
    <ActionStepContainer
      stepNumber="1"
      :complete="poolId !== null"
      headline="Create Your Auction"
      subHeadline="Deploy LBP, Deposit assets, Schedule weight change"
      buttonText="Create"
      :buttonTextLoading="fetchingPoolData ? 'Fetching Pool...' : 'Creating...'"
      :loading="creatingAuction"
      :disabled="false"
      @button-click="createAuction()"
    >
      <template v-slot:completeContent>
        <div class="text-sm">{{ poolId }}</div>
        <div class="text-sm text-right">{{ poolAddress }}</div>
      </template>
    </ActionStepContainer>
  </div>
  <ActionStepContainer
    stepNumber="2"
    :complete="false"
    headline="Save Project Details"
    subHeadline="Store your project details off chain"
    buttonText="Save"
    buttonTextLoading="Saving..."
    :loading="false"
    :disabled="false"
    completeText="testing"
  />
</template>
