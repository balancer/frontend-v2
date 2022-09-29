<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { computed, reactive, toRef, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useStaking from '@/composables/staking/useStaking';
import useEthers from '@/composables/useEthers';
import { usePool } from '@/composables/usePool';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTransactions from '@/composables/useTransactions';
import useVeBal from '@/composables/useVeBAL';
import { POOLS } from '@/constants/pools';
import { boostedJoinBatchSwap } from '@/lib/utils/balancer/swapper';
import PoolExchange from '@/services/pool/exchange/exchange.service';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import { InvestMathResponse } from '../../../composables/useInvestMath';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  math: InvestMathResponse;
  tokenAddresses: string[];
  disabled: boolean;
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
  (e: 'showStakeModal'): void;
}>();

/**
 * STATE
 */
const investmentState = reactive<InvestmentState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { account, getProvider, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { lockablePoolId } = useVeBal();
const { isPoolEligibleForStaking } = useStaking();

const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const {
  fullAmounts,
  batchSwapAmountMap,
  bptOut,
  fiatTotalLabel,
  batchSwap,
  shouldFetchBatchSwap,
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
    stepTooltip: t('investmentTooltip'),
  },
]);

const transactionInProgress = computed(
  (): boolean =>
    investmentState.init ||
    investmentState.confirming ||
    investmentState.confirmed
);

const isStakablePool = computed((): boolean => {
  return (
    POOLS.Stakable.AllowList.includes(props.pool.id) &&
    isPoolEligibleForStaking.value
  );
});

const normalizedBptOut = computed((): string => {
  return formatUnits(bptOut.value, props.pool?.onchain?.decimals || 18);
});

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
      poolWeightsLabel(props.pool),
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool,
    },
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
    },
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
        normalizedBptOut.value
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
  <transition>
    <BalActionSteps
      v-if="!investmentState.confirmed || !investmentState.receipt"
      :actions="actions"
      :disabled="disabled"
    />
    <div v-else>
      <ConfirmationIndicator :txReceipt="investmentState.receipt" />
      <BalBtn
        v-if="lockablePoolId === pool.id"
        tag="router-link"
        :to="{ name: 'get-vebal' }"
        color="gradient"
        block
        class="flex mt-2"
      >
        <StarsIcon class="mr-2 h-5 text-orange-300" />{{ $t('lockToGetVeBAL') }}
      </BalBtn>
      <BalBtn
        v-else-if="isStakablePool"
        color="gradient"
        block
        class="flex mt-2"
        @click="emit('showStakeModal')"
      >
        <StarsIcon class="mr-2 h-5 text-orange-300" />{{
          $t('stakeToGetExtra')
        }}
      </BalBtn>

      <BalBtn
        tag="router-link"
        :to="{ name: 'pool', params: { id: pool.id } }"
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
