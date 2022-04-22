<template>
  <BalCard class="mt-4 mb-3">
    <div class="mt-2 mb-3">
      Pool creation requires 2 transactions:
    </div>
    <div>
      <div class="card-container">
        <div class="card-step text-green-500">
          <BalIcon
            v-if="poolAddress !== ''"
            name="check"
            class="text-green-500"
          />
          <span v-else class="text-gray-500 dark:text-gray-400">1</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Create Pool</span>
        </div>
        <BalBtn
          v-if="poolAddress === ''"
          @click="createModalVisible = true"
          :disabled="!canCreatePool"
          size="sm"
          :loading="creating"
          loading-label="Creating..."
        >
          Create Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Pool address: {{ poolAddress }}<br />Pool id: {{ poolId }}
        </div>
      </div>
      <div class="card-container mt-3">
        <div class="card-step text-green-500">
          <BalIcon v-if="joined" name="check" class="text-green-500" />
          <span v-else class="text-gray-500 dark:text-gray-400">2</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Join Pool</span>
        </div>
        <BalBtn
          v-if="!joined"
          @click="joinPool"
          :disabled="poolAddress === ''"
          size="sm"
          :loading="joining"
          loading-label="Joining..."
        >
          Join Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Joined
        </div>
      </div>
      <!--      <div class="card-container mt-3">
        <div class="card-step text-green-500">
          <BalIcon v-if="verified" name="check" class="text-green-500" />
          <span v-else class="text-gray-500 dark:text-gray-400">3</span>
        </div>
        <div class="ml-3 flex-1">
          <span>Verify Pool</span>
        </div>
        <BalBtn
          v-if="true"
          @click="verifyPool"
          :disabled="poolAddress === ''"
          size="sm"
          :loading="verifying"
          loading-label="Verifying..."
        >
          Verify Pool
        </BalBtn>
        <div v-else class="ml-4 text-sm">
          Verified
        </div>
      </div>-->
      <div v-if="joined" class="mt-6 mb-2">
        <p class="text-yellow-500">
          Please follow these instructions at
          <BalLink
            href="https://docs.beets.fi/developers/pool-verification"
            external
            >Pool Verification</BalLink
          >
          to verify your pool.
        </p>
      </div>
    </div>
  </BalCard>
  <teleport to="#modal">
    <PoolCreateConfirmModal
      v-if="createModalVisible"
      @create="createPool"
      @close="createModalVisible = false"
    />
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useStore } from 'vuex';
import useTokenLists from '@/composables/useTokenLists';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import {
  PoolCreatorService,
  PoolTokenInput
} from '@/beethovenx/services/pool/creator/pool-creator.service';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import PoolCreateConfirmModal from '@/beethovenx/components/pages/pool-create/PoolCreateConfirmModal.vue';
import { TransactionReceipt } from '@ethersproject/providers';

export default defineComponent({
  components: {
    PoolCreateConfirmModal,
    BalIcon,
    BalBtn,
    BalCard
  },
  props: {
    swapFeePercentage: {
      type: String,
      required: true
    },
    poolOwner: {
      type: String,
      required: true
    },
    poolSymbol: {
      type: String,
      required: true
    },
    poolName: {
      type: String,
      required: true
    },
    poolTokens: {
      type: Array as PropType<PoolTokenInput[]>,
      required: true
    },
    canCreatePool: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'poolNameChange',
    'poolSymbolChange',
    'poolOwnerChange',
    'poolSwapFeePercentageChange',
    'isInputValid',
    'createPoolTriggered',
    'createPoolError',
    'createdPool',
    'verifiedPool'
  ],

  setup(props, { emit }) {
    const store = useStore();
    const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
    const { appNetworkConfig, getProvider, account } = useWeb3();
    const { tokens } = useTokens();
    const { txListener } = useEthers();
    const { addTransaction } = useTransactions();
    const appLoading = computed(() => store.state.app.loading);
    const poolCreatorService = computed(
      () => new PoolCreatorService(appNetworkConfig.key)
    );

    const verifying = ref(false);
    const verified = ref(false);
    const creating = ref(false);
    const joining = ref(false);
    const joined = ref(false);
    const createModalVisible = ref(false);
    const blockHash = ref('');
    const poolAddress = ref('');
    const poolId = ref('');

    async function createPool(): Promise<void> {
      createModalVisible.value = false;

      const {
        poolName,
        poolSymbol,
        poolOwner,
        swapFeePercentage,
        poolTokens
      } = props;

      const isWeightedPool2Tokens = props.poolTokens.length === 2;

      try {
        emit('createPoolTriggered');
        creating.value = true;
        const tx = await poolCreatorService.value.createWeightedPool(
          getProvider(),
          props.poolName,
          `BPT-${poolSymbol}`,
          poolOwner,
          swapFeePercentage,
          poolTokens,
          isWeightedPool2Tokens
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
            const data = await poolCreatorService.value.getPoolDataFromTransaction(
              getProvider(),
              receipt,
              isWeightedPool2Tokens
            );
            poolAddress.value = data.poolAddress;
            blockHash.value = data.blockHash;
            poolId.value = data.poolId;

            emit('createdPool', data.poolId);
            creating.value = false;
          },
          onTxFailed: () => {
            creating.value = false;
            emit('createPoolError');
          }
        });
      } catch (error) {
        console.error(error);
        creating.value = false;
        emit('createPoolError');
      }
    }

    async function joinPool(): Promise<void> {
      try {
        joining.value = true;
        const tx = await poolCreatorService.value.joinPool(
          getProvider(),
          props.poolTokens,
          poolId.value,
          account.value,
          tokens.value
        );

        addTransaction({
          id: tx.hash,
          type: 'tx',
          action: 'invest',
          summary: `Joining your pool with name: ${props.poolName}`,
          details: {}
        });

        txListener(tx, {
          onTxConfirmed: async () => {
            joining.value = false;
            joined.value = true;
            emit('verifiedPool');
          },
          onTxFailed: () => {
            joining.value = false;
          }
        });
      } catch (error) {
        console.error(error);
        joining.value = false;
      }
    }

    async function verifyPool() {
      const {
        poolName,
        poolSymbol,
        poolOwner,
        swapFeePercentage,
        poolTokens
      } = props;

      try {
        verifying.value = true;
        await poolCreatorService.value.verifyPool(
          getProvider(),
          poolName,
          `BPT-${poolSymbol}`,
          poolOwner,
          swapFeePercentage,
          poolTokens,
          poolAddress.value,
          blockHash.value
        );

        verifying.value = false;
        verified.value = true;
        //emit('verifiedPool');
      } catch {
        verifying.value = false;
      }
    }

    return {
      appLoading,
      loadingTokenLists,
      tokenListsLoaded,
      createPool,
      joinPool,
      poolAddress,
      poolId,
      blockHash,
      creating,
      joining,
      joined,
      verifyPool,
      verifying,
      verified,
      createModalVisible
    };
  }
});
</script>
<style scoped>
.card-container {
  @apply p-3 flex items-center border rounded-lg dark:border-gray-800;
}
.card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
