<script setup lang="ts">
import useLbpState from '@/beethovenx/lbp/composables/useLbpState';
import { TransactionReceipt } from '@ethersproject/providers';
import { computed } from 'vue';
import { PoolCreatorService } from '@/beethovenx/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import useTokens from '@/composables/useTokens';
import { CopperProxyService } from '@/beethovenx/services/pool/copper-proxy.service';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';

const { appNetworkConfig, getProvider } = useWeb3();
const {
  data,
  creatingAuction,
  poolId,
  poolAddress,
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
    Now that your auction configuration is ready you need to deploy it to the
    Fantom Blockchain. To do so, you must sign a transaction using your wallet.
  </div>

  <div class="border-purple-500 border-2 rounded-lg px-4 py-4 mb-8">
    <div>
      <p class="mb-3">Trades disabled by default</p>
      <p class="mb-3">
        Trades are disabled upon auction creation to prevent auction
        participants from trading before the auction token price decay is
        scheduled to start. You have the option to enable trading in the Auction
        Settings tab and we recommend that you do so right as the auction token
        price decay is scheduled to start. The Auction Settings tab will become
        available on the auction page once you’ve created the auction.
      </p>
      <a href="" class="text-green-500 underline">More Info</a>
    </div>
  </div>

  <BalBtn
    v-if="creatingAuction || poolId === null"
    @click="createAuction()"
    :loading="creatingAuction"
    :loading-label="
      fetchingPoolData ? 'Saving Your Auction...' : 'Creating Your Auction...'
    "
    :disabled="false"
    size="md"
    :block="true"
    class="mt-8 mb-4"
  >
    Create Your Auction
  </BalBtn>
  <div v-else>
    <div class="text-lg">Pool ID: {{ poolId }}</div>
    <div class="text-lg">Pool Address: {{ poolAddress }}</div>
  </div>
</template>
