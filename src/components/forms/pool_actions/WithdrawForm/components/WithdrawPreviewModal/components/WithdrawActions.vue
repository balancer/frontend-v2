<script setup lang="ts">
import {
  toRef,
  toRefs,
  ref,
  computed,
  reactive,
  onBeforeMount,
  watch
} from 'vue';
import { usePool } from '@/composables/usePool';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { WithdrawMathResponse } from '../../../composables/useWithdrawMath';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';
import useWithdrawalState from '../../../composables/useWithdrawalState';
// Services
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { boostedExitBatchSwap } from '@/lib/utils/balancer/swapper';
import { formatUnits } from '@ethersproject/units';
import { TransactionActionInfo } from '@/types/transactions';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  math: WithdrawMathResponse;
};

type WithdrawalState = {
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
const withdrawalState = reactive<WithdrawalState>({
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
const { account, getProvider, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const { tokenOutIndex, tokensOut, batchRelayerApproval } = useWithdrawalState(
  toRef(props, 'pool')
);

const {
  bptIn,
  fiatTotalLabel,
  amountsOut,
  exactOut,
  singleAssetMaxOut,
  batchSwap,
  batchSwapAmountsOutMap,
  batchSwapKind,
  shouldUseBatchRelayer,
  batchRelayerSwap,
  shouldFetchBatchSwap
} = toRefs(props.math);

const withdrawalAction: TransactionActionInfo = {
  label: t('withdraw.label'),
  loadingLabel: t('withdraw.preview.loadingLabel.withdraw'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('withdraw.preview.tooltips.withdrawStep')
};

const actions = ref<TransactionActionInfo[]>([withdrawalAction]);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const transactionInProgress = computed(
  (): boolean =>
    withdrawalState.init ||
    withdrawalState.confirming ||
    withdrawalState.confirmed
);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: t('transactionSummary.withdrawFromPool', [
      fiatTotalLabel.value,
      poolWeightsLabel(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  withdrawalState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      withdrawalState.confirming = false;
      withdrawalState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      withdrawalState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      withdrawalState.confirming = false;
    }
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    let tx;
    withdrawalState.init = true;

    if (shouldUseBatchRelayer.value && batchRelayerSwap.value) {
      tx = await balancerContractsService.batchRelayer.execute(
        batchRelayerSwap.value,
        getProvider()
      );
    } else if (batchSwap.value) {
      tx = await boostedExitBatchSwap(
        batchSwap.value.swaps,
        batchSwap.value.assets,
        props.pool.address,
        bptIn.value,
        batchSwapAmountsOutMap.value,
        batchSwapKind.value
      );
    } else {
      tx = await poolExchange.exit(
        getProvider(),
        account.value,
        amountsOut.value,
        tokensOut.value,
        formatUnits(bptIn.value, props.pool.onchain.decimals),
        singleAssetMaxOut.value ? tokenOutIndex.value : null,
        exactOut.value
      );
    }

    withdrawalState.init = false;
    withdrawalState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    withdrawalState.init = false;
    withdrawalState.confirming = false;
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (shouldUseBatchRelayer.value && !batchRelayerApproval.isUnlocked.value) {
    // Prepend relayer approval action if batch relayer not approved
    actions.value.unshift(batchRelayerApproval.action.value);
  }
});

/**
 * WATCHERS
 */
watch(blockNumber, async () => {
  if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
    await props.math.getSwap();
  }
});
</script>

<template>
  <transition>
    <BalActionSteps v-if="!withdrawalState.confirmed" :actions="actions" />
    <div v-else>
      <ConfirmationIndicator :txReceipt="withdrawalState.receipt" />
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
    </div>
  </transition>
</template>
