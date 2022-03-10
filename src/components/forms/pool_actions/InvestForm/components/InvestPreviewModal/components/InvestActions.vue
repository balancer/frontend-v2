<script setup lang="ts">
import { toRef, toRefs, computed, reactive, watch, onBeforeMount } from 'vue';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { poolWeightsLabel, usePool } from '@/composables/usePool';
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
import { useRoute, useRouter } from 'vue-router';
import useConfig from '@/composables/useConfig';
import { configService } from '@/services/config/config.service';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import { TransactionActionInfo } from '@/types/transactions';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';
import { boostedJoinBatchSwap } from '@/lib/utils/balancer/swapper';
import { balancer } from '@/lib/balancer.sdk';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import useUserSettings from '@/composables/useUserSettings';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import useTokens from '@/composables/useTokens';
import { AddressZero } from '@ethersproject/constants';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
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
const router = useRouter();
const { t } = useI18n();
const { networkConfig } = useConfig();
const { account, getProvider, explorerLinks, blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { nativeAsset } = useTokens();
const {
  fullAmounts,
  batchSwapAmountMap,
  bptOut,
  fiatTotalLabel,
  batchSwap,
  shouldFetchBatchSwap,
  fullAmountsScaled
} = toRefs(props.math);

const { stakeBptInFarm } = useInvestState();
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);
const { tokenApprovalActions } = useTokenApprovalActions(
  props.tokenAddresses,
  fullAmounts
);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));
const { slippageScaled } = useUserSettings();

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

const { isWeightedPoolWithNestedLinearPools } = usePool(toRef(props, 'pool'));

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

    if (
      isWeightedPoolWithNestedLinearPools.value ||
      (stakeBptInFarm.value && props.pool.farm)
    ) {
      await balancer.swaps.fetchPools();
      const tokenAddresses = props.tokenAddresses;
      let nativeAssetAmount: string | null = null;

      for (let i = 0; i < tokenAddresses.length; i++) {
        if (tokenAddresses[i] === nativeAsset.address) {
          nativeAssetAmount = fullAmountsScaled.value[i].toString();
        }
      }

      const response = await balancer.relayer.joinPool({
        poolId: props.pool.id,
        tokens: props.tokenAddresses.map((address, idx) => {
          return {
            address: address === nativeAsset.address ? AddressZero : address,
            amount: fullAmounts.value[idx].toString()
          };
        }),
        bptOut: '0',
        fetchPools: {
          fetchPools: false,
          fetchOnChain: false
        },
        slippage: slippageScaled.value,
        funds: {
          sender: account.value,
          recipient: account.value,
          fromInternalBalance: false,
          toInternalBalance: false
        },
        farmId:
          props.pool.id === networkConfig.fBeets.poolId
            ? parseInt(networkConfig.fBeets.farmId)
            : props.pool.farm && stakeBptInFarm.value
            ? parseInt(props.pool.farm.id)
            : undefined,
        mintFBeets: props.pool.id === networkConfig.fBeets.poolId
      });

      tx = await balancerContractsService.batchRelayer.stableExit(
        response,
        getProvider(),
        nativeAssetAmount ? { value: nativeAssetAmount } : {}
      );
    } else if (batchSwap.value) {
      tx = await boostedJoinBatchSwap(
        configService.network.key,
        getProvider(),
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

onBeforeMount(() => {
  if (
    (isWeightedPoolWithNestedLinearPools.value || stakeBptInFarm.value) &&
    !batchRelayerApproval.isUnlocked.value
  ) {
    // Prepend relayer approval action if batch relayer not approved
    actions.value.unshift(batchRelayerApproval.action.value);
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
      <BalBtn color="gray" outline block class="mt-2" @click="$router.back()">
        Finished investing
      </BalBtn>
    </template>
  </div>
</template>
