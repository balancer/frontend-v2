<script setup lang="ts">
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import { TransactionReceipt } from '@ethersproject/providers';
import { computed, ref } from 'vue';
import { PoolCreatorService } from '@/beethovenx/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import useTokens from '@/composables/useTokens';
import { CopperProxyService } from '@/beethovenx/services/pool/copper-proxy.service';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { omit } from 'lodash';
import ActionStepContainer from '@/beethovenx/components/containers/ActionStepContainer.vue';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { useRouter } from 'vue-router';

const { appNetworkConfig, getProvider, account } = useWeb3();
const {
  data,
  creatingLge,
  poolId,
  poolAddress,
  fetchingPoolData,
  savingLge,
  lgeSaved
} = useLgeCreateState();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { tokens } = useTokens();

const successModalOpen = ref(false);
const router = useRouter();

const copperProxyService = computed(
  () => new CopperProxyService(appNetworkConfig.key)
);
const poolCreatorService = computed(
  () => new PoolCreatorService(appNetworkConfig.key)
);

async function createAuction(): Promise<void> {
  const { poolName, poolSymbol } = data.value;

  try {
    creatingLge.value = true;

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
        const poolData = await poolCreatorService.value.getPoolDataFromTransaction(
          getProvider(),
          receipt
        );

        poolAddress.value = poolData.poolAddress;
        poolId.value = poolData.poolId;

        fetchingPoolData.value = false;
        creatingLge.value = false;
      },
      onTxFailed: () => {
        creatingLge.value = false;
      }
    });
  } catch (error) {
    console.error(error);
    creatingLge.value = false;
  }
}

async function saveAuction() {
  if (poolId.value && poolAddress.value) {
    savingLge.value = true;

    await beethovenxService.createLge(
      getProvider(),
      {
        ...omit(data.value, ['startTime', 'endTime', 'poolName', 'poolSymbol']),
        startDate: `${data.value.startDate}T${data.value.startTime}:00Z`,
        endDate: `${data.value.endDate}T${data.value.endTime}:00Z`,
        id: poolId.value,
        address: poolAddress.value,
        swapFeePercentage: `${data.value.swapFeePercentage}`
      },
      account.value
    );

    savingLge.value = false;
    lgeSaved.value = true;
    successModalOpen.value = true;
  }
}

function closeSuccessModal() {
  successModalOpen.value = false;
}

function goToLge() {
  router.push({ name: 'lge', params: { id: poolId.value } });
}
</script>

<template>
  <div class="mb-6">
    Now that your auction configuration is ready, you need to deploy it to the
    Fantom Blockchain. To do so, you must sign two transactions.
  </div>

  <div class="border-purple-500 border-2 rounded-lg px-4 py-4 mb-8">
    <div>
      <p class="mb-3">
        Trades are initially disabled to prevent auction participants from
        trading before the auction token price decay is scheduled to start. You
        have the option to enable trading in the Auction Settings tab and we
        recommend that you do so right as the auction token price decay is
        scheduled to start. The Auction Settings tab will become available on
        the auction page once you’ve created the auction.
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

  <ActionStepContainer
    step-number="1"
    :complete="poolId !== null && creatingLge === false"
    :loading="creatingLge"
    headline="Create Your Auction"
    subHeadline="Deploy pool, Deposit funds, Schedule weight changes"
    buttonText="Create"
    :buttonTextLoading="fetchingPoolData ? 'Fetching Pool...' : 'Creating...'"
    @button-click="createAuction()"
  >
    <template v-slot:completeContent>
      <div class="text-right text-gray-500">Auction Created</div>
    </template>
  </ActionStepContainer>
  <div class="my-4">
    <ActionStepContainer
      step-number="2"
      :complete="lgeSaved"
      :loading="savingLge"
      :disabled="poolId === null || creatingLge"
      headline="Save Your Project Details"
      buttonText="Save"
      buttonTextLoading="Saving..."
      @button-click="saveAuction()"
    >
      <template v-slot:completeContent>
        <div class="text-right text-gray-500">Auction Saved</div>
      </template>
    </ActionStepContainer>
  </div>
  <div v-if="lgeSaved" class="mt-8">
    <div class="mb-2">
      <a
        href="https://docs.beethovenx.io/developers/pool-verification"
        target="_blank"
        class="text-green-500"
      >
        My Auction Page
      </a>
    </div>
    <div>
      <a
        href="https://docs.beethovenx.io/developers/pool-verification"
        target="_blank"
        class="text-green-500"
      >
        Pool Verification Tutorial
      </a>
    </div>

    <div>Pool ID: {{ poolId }}</div>
    <div>Pool Address: {{ poolAddress }}</div>
  </div>
  <BalModal
    :show="successModalOpen"
    @close="closeSuccessModal"
    :fireworks="true"
  >
    <div class="-mx-4 p-4">
      <div class="w-full">
        <h3 class="mb-2">Congratulations!</h3>
        <p>
          You've created a Liquidity Generation Event.
        </p>
      </div>
      <BalBtn class="mt-12" label="Take me to my LGE" block @click="goToLge" />
    </div>
  </BalModal>
</template>
