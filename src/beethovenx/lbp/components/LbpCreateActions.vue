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
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { sleep } from '@/lib/utils';
import { callStatic } from '@/lib/utils/balancer/web3';
import { default as weightedPoolAbi } from '@/beethovenx/abi/WeightedPool.json';

const { appNetworkConfig, getProvider, account } = useWeb3();
const {
  data,
  creatingLge,
  poolId,
  poolAddress,
  fetchingPoolData,
  savingLge,
  lgeSaved,
  createTransactionHash,
  lbpCreateTriggered
} = useLgeCreateState();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { tokens } = useTokens();

const successModalOpen = ref(false);
const router = useRouter();

const copperProxyService = computed(
  () => new CopperProxyService(appNetworkConfig.key)
);

async function createAuction(): Promise<void> {
  try {
    copperProxyService.value
      .createAuction(getProvider(), data.value, tokens.value)
      .then(tx => {
        createTransactionHash.value = tx.hash;
      });

    lbpCreateTriggered.value = true;
  } catch (error) {
    console.error(error);
    creatingLge.value = false;
  }
}

async function fetchLbpData() {
  fetchingPoolData.value = true;

  //generous amount of retries, to give the subgraph time to catch up.
  for (let i = 0; i < 5; i++) {
    await sleep(1000);

    const data = await balancerSubgraphService.pools.getPoolDataFromTxHash(
      createTransactionHash.value
    );

    if (data) {
      if (
        data.poolType !== 'LiquidityBootstrapping' ||
        data.owner !== appNetworkConfig.addresses.copperProxy.toLowerCase()
      ) {
        throw new Error('Invalid pool');
      }

      poolId.value = data.id;
      poolAddress.value = data.address;

      break;
    }
  }

  fetchingPoolData.value = false;
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
    Fantom Blockchain. When you click the button below and sign the transaction,
    the contract will deploy your pool, deposit your funds and schedule the
    auction weight changes
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
  <!--  <ActionStepContainer
    step-number="1"
    :complete="poolId !== null && creatingLge === false"
    :loading="creatingLge"
    headline="Create Your Auction"
    subHeadline="Deploy pool, Deposit funds, Schedule weight changes"
    buttonText="Create"
    :buttonTextLoading="
      savingLge
        ? 'Saving data...'
        : fetchingPoolData
        ? 'Fetching Pool Info...'
        : 'Creating...'
    "
    @button-click="createAuction()"
  >
    <template v-slot:completeContent>
      <div class="text-right text-gray-500">Auction Created</div>
    </template>
  </ActionStepContainer>-->
  <ActionStepContainer
    step-number="1"
    :complete="lbpCreateTriggered"
    :loading="creatingLge"
    headline="Create Your Auction"
    subHeadline="Deploy pool, Deposit funds, Schedule weight changes"
    buttonText="Create"
    buttonTextLoading="Creating..."
    @button-click="createAuction()"
  >
    <template v-slot:completeContent>
      <BalBtn
        v-if="poolId === null"
        @click="createAuction()"
        size="sm"
        :loading="creatingLge"
        loading-label="Creating..."
      >
        <div class="w-28">
          Try again
        </div>
      </BalBtn>
      <div v-else class="text-right text-gray-500">Auction Created</div>
    </template>
  </ActionStepContainer>
  <div class="mt-4">
    <ActionStepContainer
      step-number="2"
      :complete="poolId !== null"
      :loading="fetchingPoolData"
      :disabled="!lbpCreateTriggered"
      headline="Fetch LBP Details Onchain"
      subHeadline="Fetch the pool ID and address of your LBP"
      buttonText="Fetch"
      buttonTextLoading="Fetching Pool Info..."
      @button-click="fetchLbpData()"
    >
      <template v-slot:completeContent>
        <div class="text-right text-gray-500">LBP data fetched</div>
      </template>
      <template
        v-if="lbpCreateTriggered && poolId === null"
        v-slot:underContent
      >
        <BalTextInput
          v-model="createTransactionHash"
          type="text"
          size="sm"
          class="mt-4"
          placeholder="Enter the transaction hash from Step 1"
        />
      </template>
    </ActionStepContainer>
  </div>
  <div class="my-4">
    <ActionStepContainer
      step-number="3"
      :complete="lgeSaved"
      :loading="savingLge"
      :disabled="poolId === null || !lbpCreateTriggered"
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
        My LBP Page
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
          You've created a Liquidity Bootstrapping Pool.
        </p>
      </div>
      <BalBtn class="mt-12" label="Take me to my LGE" block @click="goToLge" />
    </div>
  </BalModal>
</template>
