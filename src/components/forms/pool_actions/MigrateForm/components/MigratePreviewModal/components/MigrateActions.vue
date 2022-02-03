<script setup lang="ts">
import { ref, computed, reactive, onBeforeMount, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { StablePoolEncoder, WeightedPoolEncoder } from '@balancer-labs/sdk';
import { BigNumber, BigNumberish } from 'ethers';

// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { TransactionActionInfo } from '@/types/transactions';
import { TokenInfo } from '@/types/TokenList';

// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useConfig from '@/composables/useConfig';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import useUserSettings from '@/composables/useUserSettings';
import { MigrateMathResponse } from '../../../composables/useMigrateMath';

// Services
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';

// Libs
import { balancer } from '@/lib/balancer.sdk';
import { isStableLike } from '@/composables/usePool';

/**
 * TYPES
 */
type Props = {
  fromPool: FullPool;
  toPool: FullPool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  math: MigrateMathResponse;
  disabled?: boolean;
};

type MigratePoolState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const {
  fiatTotalLabel,
  bptBalanceScaled,
  fullAmountsScaled,
  tokenCount,
  shouldFetchBatchSwap
} = toRefs(props.math);

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

/**
 * STATE
 */
const migratePoolState = reactive<MigratePoolState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { networkConfig } = useConfig();
const { getProvider, explorerLinks, account, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { slippageScaled } = useUserSettings();
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const migrateAction: TransactionActionInfo = {
  label: t('migratePool.previewModal.actions.title'),
  loadingLabel: t('migratePool.previewModal.actions.loading'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('migratePool.previewModal.actions.migrationStep')
};

const actions = ref<TransactionActionInfo[]>([migrateAction]);

/**
 * COMPUTED
 */
const explorerLink = computed(() =>
  migratePoolState.receipt
    ? explorerLinks.txLink(migratePoolState.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  () =>
    migratePoolState.init ||
    migratePoolState.confirming ||
    migratePoolState.confirmed
);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'migratePool',
    summary: t('transactionSummary.migratePool', [
      fiatTotalLabel.value,
      props.fromPoolTokenInfo.symbol,
      props.toPoolTokenInfo.symbol
    ]),
    details: {
      fromPool: props.fromPool,
      toPool: props.toPool,
      totalFiatPoolInvestment: fiatTotalLabel.value
    }
  });

  migratePoolState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      migratePoolState.confirming = false;
      migratePoolState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      migratePoolState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      migratePoolState.confirming = false;
    }
  });
}

async function submit() {
  try {
    let tx: TransactionResponse;
    migratePoolState.init = true;

    let userData = '';
    if (isStableLike(props.fromPool.poolType)) {
      userData = StablePoolEncoder.exitExactBPTInForTokensOut(
        bptBalanceScaled.value
      );
    } else {
      userData = WeightedPoolEncoder.exitExactBPTInForTokensOut(
        bptBalanceScaled.value
      );
    }

    const txInfo = await balancer.relayer.exitPoolAndBatchSwap({
      exiter: account.value,
      swapRecipient: account.value,
      poolId: props.fromPool.id,
      exitTokens: props.fromPool.tokensList,
      userData,
      expectedAmountsOut: fullAmountsScaled.value.map(amount =>
        amount.toString()
      ),
      finalTokensOut: new Array(tokenCount.value).fill(props.toPool.address),
      slippage: slippageScaled.value,
      fetchPools: {
        fetchPools: true,
        fetchOnChain: false
      }
    });

    const hasInvalidAmount = txInfo.outputs?.amountsOut.some(
      (amount: BigNumberish) => BigNumber.from(amount).isZero()
    );

    if (hasInvalidAmount) {
      throw new Error('exitPoolAndBatchSwap returned invalid amounts.');
    }

    tx = await balancerContractsService.batchRelayer.execute(
      txInfo,
      getProvider()
    );

    migratePoolState.init = false;
    migratePoolState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (!batchRelayerApproval.isUnlocked.value) {
    // Prepend relayer approval action if batch relayer not approved
    actions.value.unshift(batchRelayerApproval.action.value);
  }
});

/**
 * WATCHERS
 */
watch(blockNumber, async () => {
  if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
    await props.math.getBatchSwap();
  }
});
</script>

<template>
  <div>
    <BalActionSteps
      v-if="!migratePoolState.confirmed"
      :actions="actions"
      :disabled="disabled"
    />
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ migratePoolState.confirmedAt }}
          </span>
        </div>
        <BalLink
          :href="explorerLink"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <BalBtn
        tag="router-link"
        :to="{ name: 'pool', params: { id: toPool.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('goToMigratedPool') }}
      </BalBtn>
    </template>
  </div>
</template>
