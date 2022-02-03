<script setup lang="ts">
import { toRef, toRefs, computed, reactive, watch } from 'vue';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { usePool } from '@/composables/usePool';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { InvestMathResponse } from '../../../composables/useInvestMath';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';
import useConfig from '@/composables/useConfig';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import { TransactionActionInfo } from '@/types/transactions';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import { boostedJoinBatchSwap } from '@/lib/utils/balancer/swapper';
/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  math: InvestMathResponse;
  tokenAddresses: string[];
};

type InvestmentState = {
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

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

/**
 * STATE
 */
const investmentState = reactive<InvestmentState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const route = useRoute();
const { t } = useI18n();
const { networkConfig } = useConfig();
const { account, getProvider, explorerLinks, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const {
  fullAmounts,
  batchSwapAmountMap,
  bptOut,
  fiatTotalLabel,
  batchSwap,
  shouldFetchBatchSwap
} = toRefs(props.math);

const { tokenApprovalActions } = useTokenApprovalActions(
  props.tokenAddresses,
  fullAmounts
);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const actions = computed((): TransactionActionInfo[] => [
  ...tokenApprovalActions,
  {
    label: t('invest'),
    loadingLabel: t('investment.preview.loadingLabel.investment'),
    confirmingLabel: t('confirming'),
    action: submit,
    stepTooltip: t('investmentTooltip')
  }
]);

const explorerLink = computed((): string =>
  investmentState.receipt
    ? explorerLinks.txLink(investmentState.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  (): boolean =>
    investmentState.init ||
    investmentState.confirming ||
    investmentState.confirmed
);

/**
 * METHODS
 */

async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('transactionSummary.investInPool', [
      fiatTotalLabel.value,
      poolWeightsLabel(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      investmentState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      investmentState.confirmedAt = dateTimeLabelFor(confirmedAt);
      investmentState.confirmed = true;
      investmentState.confirming = false;
    },
    onTxFailed: () => {
      console.error('Invest failed');
      investmentState.confirming = false;
    }
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    let tx;
    investmentState.init = true;

    if (batchSwap.value) {
      tx = await boostedJoinBatchSwap(
        batchSwap.value.swaps,
        batchSwap.value.assets,
        props.pool.address,
        batchSwapAmountMap.value,
        BigNumber.from(bptOut.value)
      );
    } else {
      tx = await poolExchange.join(
        getProvider(),
        account.value,
        fullAmounts.value,
        props.tokenAddresses,
        formatUnits(bptOut.value, props.pool.onchain.decimals)
      );
    }

    investmentState.init = false;
    investmentState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

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
    <BalActionSteps :actions="actions" />
    <template v-if="investmentState.confirmed">
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ investmentState.confirmedAt }}
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
        :to="{ name: 'pool', params: { id: route.params.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('returnToPool') }}
      </BalBtn>
    </template>
  </div>
</template>
