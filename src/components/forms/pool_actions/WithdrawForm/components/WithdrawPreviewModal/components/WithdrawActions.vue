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
import { poolWeightsLabel } from '@/composables/usePool';
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
import useConfig from '@/composables/useConfig';
import useWithdrawalState from '../../../composables/useWithdrawalState';
// Services
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { boostedExitBatchSwap } from '@/lib/utils/balancer/swapper';
import { configService } from '@/services/config/config.service';
import { formatUnits } from '@ethersproject/units';
import { TransactionActionInfo } from '@/types/transactions';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';

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
const { networkConfig } = useConfig();
const { account, getProvider, explorerLinks, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
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
const explorerLink = computed((): string =>
  withdrawalState.receipt
    ? explorerLinks.txLink(withdrawalState.receipt.transactionHash)
    : ''
);

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
      tx = await balancerContractsService.batchRelayer.stableExit(
        batchRelayerSwap.value,
        getProvider()
      );
    } else if (batchSwap.value) {
      tx = await boostedExitBatchSwap(
        configService.network.key,
        getProvider(),
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
  <div>
    <BalActionSteps v-if="!withdrawalState.confirmed" :actions="actions" />
    <template v-else>
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ withdrawalState.confirmedAt }}
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
