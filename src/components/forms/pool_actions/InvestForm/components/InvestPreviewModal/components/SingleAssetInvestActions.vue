<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { computed, reactive, toRef, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useStaking from '@/composables/staking/useStaking';
import useEthers from '@/composables/useEthers';
import { usePool } from '@/composables/usePool';
import { dateTimeLabelFor } from '@/composables/useTime';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTransactions from '@/composables/useTransactions';
import useUserSettings from '@/composables/useUserSettings';
import useVeBal from '@/composables/useVeBAL';
import { POOLS } from '@/constants/pools';
import { balancer } from '@/lib/balancer.sdk';
import { boostedJoinBatchSwap } from '@/lib/utils/balancer/swapper';
import PoolExchange from '@/services/pool/exchange/exchange.service';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import { SingleAssetInvestMathResponse } from '../../../composables/useSingleAssetInvestMath';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  math: SingleAssetInvestMathResponse;
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
  confirmedAt: ''
});

/**
 * COMPOSABLES
 */
const route = useRoute();
const { t } = useI18n();
const { account, getProvider, blockNumber, getSigner } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { lockablePoolId } = useVeBal();
const { isPoolEligibleForStaking } = useStaking();
const { slippage, slippageScaled } = useUserSettings();

const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const {
  // fullAmounts,
  // batchSwapAmountMap,
  // bptOut,
  fullAmount,
  fiatTotalLabel,
  // batchSwap,
  shouldFetchBatchSwap,
  getSwapRoute,
  swapRoute
} = toRefs(props.math);

const fullAmounts = computed(() => [fullAmount.value]);

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

const transactionInProgress = computed(
  (): boolean =>
    investmentState.init ||
    investmentState.confirming ||
    investmentState.confirmed
);

const isStakablePool = computed((): boolean => {
  return (
    POOLS.Stakable.AllowList.includes(route.params.id as string) &&
    isPoolEligibleForStaking.value
  );
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
  const deadline = BigNumber.from(`${Math.ceil(Date.now() / 1000) + 60}`); // 60 seconds from now
  const maxSlippage = parseFloat(slippage.value) * 10000;
  console.log({ swapRoute: swapRoute.value });

  if (swapRoute.value) {
    const transactionAttributes = balancer.swaps.buildSwap({
      userAddress: account.value,
      swapInfo: swapRoute.value,
      kind: 0,
      deadline,
      maxSlippage
    });
    console.log({ transactionAttributes });
    const { to, data, value } = transactionAttributes;
    const tx = await getSigner().sendTransaction({ to, data, value });
    console.log({ tx });
    investmentState.init = false;
    investmentState.confirming = true;
    console.log('Receipt', tx);
    handleTransaction(tx);
    return tx;
  }

  // TODO
  return Promise.reject(new Error('Not implemented'));
  // try {
  //   let tx;
  //   investmentState.init = true;
  //   if (batchSwap.value) {
  //     tx = await boostedJoinBatchSwap(
  //       batchSwap.value.swaps,
  //       batchSwap.value.assets,
  //       props.pool.address,
  //       batchSwapAmountMap.value,
  //       BigNumber.from(bptOut.value)
  //     );
  //   } else {
  //     tx = await poolExchange.join(
  //       getProvider(),
  //       account.value,
  //       fullAmounts.value,
  //       props.tokenAddresses,
  //       formatUnits(bptOut.value, props.pool?.onchain?.decimals || 18)
  //     );
  //   }
  //   investmentState.init = false;
  //   investmentState.confirming = true;
  //   console.log('Receipt', tx);
  //   handleTransaction(tx);
  //   return tx;
  // } catch (error) {
  //   console.error(error);
  //   return Promise.reject(error);
  // }
}

/**
 * WATCHERS
 */
watch(blockNumber, async () => {
  if (shouldFetchBatchSwap.value && !transactionInProgress.value) {
    console.log('blockNumber changed');
    // await props.math.getBatchSwap();
  }
});
</script>

<template>
  <transition>
    <BalActionSteps
      v-if="!investmentState.confirmed"
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
        class="mt-2 flex"
      >
        <StarsIcon class="h-5 text-orange-300 mr-2" />{{ $t('lockToGetVeBAL') }}
      </BalBtn>
      <BalBtn
        v-else-if="isStakablePool"
        color="gradient"
        block
        class="mt-2 flex"
        @click="emit('showStakeModal')"
      >
        <StarsIcon class="h-5 text-orange-300 mr-2" />{{
          $t('stakeToGetExtra')
        }}
      </BalBtn>

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
