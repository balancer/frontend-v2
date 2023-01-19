<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQueryClient } from 'vue-query';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useStaking from '@/composables/staking/useStaking';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { bnum } from '@/lib/utils';
import { getGaugeAddress } from '@/providers/local/staking/staking.provider';
import { AnyPool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import useTransactions from '@/composables/useTransactions';
import { tokensListExclBpt, usePool } from '@/composables/usePool';
import StakeSummary from './StakeSummary.vue';

export type StakeAction = 'stake' | 'unstake' | 'restake';
type Props = {
  pool: AnyPool;
  action: StakeAction;
};
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { balanceFor, getToken } = useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const queryClient = useQueryClient();
const { addTransaction } = useTransactions();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));

const {
  userData: {
    stakedSharesForProvidedPool,
    refetchStakedShares,
    refetchUserStakingData,
    refetchHasNonPrefGauge,
  },
  stakeBPT,
  unstakeBPT,
} = useStaking();

// Staked or unstaked shares depending on action type.
const currentShares =
  props.action === 'stake'
    ? balanceFor(getAddress(props.pool.address))
    : stakedSharesForProvidedPool.value;

const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  [props.pool.address],
  ref([currentShares])
);

const stakeAction = {
  label: t('stake'),
  loadingLabel: t('staking.staking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(stakeBPT),
  stepTooltip: t('staking.stakeTooltip'),
};

const unstakeAction = {
  label: t('unstake'),
  loadingLabel: t('staking.unstaking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(unstakeBPT),
  stepTooltip:
    props.action === 'restake'
      ? t('staking.restakeTooltip')
      : t('staking.unstakeTooltip'),
};

/**
 * STATE
 */
const isLoadingApprovalsForGauge = ref(false);
const isActionConfirmed = ref(false);
const confirmationReceipt = ref<TransactionReceipt>();
const stakeActions = ref<TransactionActionInfo[]>([]);

/**
 * WATCHERS
 */
watch(
  () => props.action,
  () => {
    if (props.action === 'stake') stakeActions.value = [stakeAction];
    if (props.action === 'unstake') stakeActions.value = [unstakeAction];
    if (props.action === 'restake')
      stakeActions.value = [unstakeAction, stakeAction];
  },
  { immediate: true }
);

/* COMPUTED */
const assetRowWidth = computed(
  () => (tokensListExclBpt(props.pool).length * 32) / 1.5
);

const isStakeAndZero = computed(
  () =>
    props.action === 'stake' && (currentShares === '0' || currentShares === '')
);

const fiatValueOfModifiedShares = ref(
  bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(currentShares)
    .toString()
);

const totalUserPoolSharePct = ref(
  bnum(
    bnum(stakedSharesForProvidedPool.value).plus(
      balanceFor(getAddress(props.pool.address))
    )
  )
    .div(props.pool.totalShares)
    .toString()
);

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  if (props.action !== 'unstake') await loadApprovalsForGauge();
});

/** METHODS */
async function handleSuccess({ receipt }) {
  isActionConfirmed.value = true;
  confirmationReceipt.value = receipt;
  await refetchStakedShares.value();
  await refetchUserStakingData.value();
  await refetchHasNonPrefGauge.value();
  await queryClient.refetchQueries(['staking']);
  emit('success');
}

async function txWithNotification(action: () => Promise<TransactionResponse>) {
  try {
    const tx = await action();
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: props.action,
      summary: t(`transactionSummary.${props.action}`, {
        pool: poolWeightsLabel(props.pool),
        amount: fNum2(fiatValueOfModifiedShares.value, FNumFormats.fiat),
      }),
      details: {
        total: fNum2(fiatValueOfModifiedShares.value, FNumFormats.fiat),
        pool: props.pool,
      },
    });
    return tx;
  } catch (error) {
    throw new Error(`Failed create ${props.action} transaction`, {
      cause: error,
    });
  }
}

async function loadApprovalsForGauge() {
  isLoadingApprovalsForGauge.value = true;
  const gaugeAddress = await getGaugeAddress(props.pool.address);
  const approvalActions = await getTokenApprovalActionsForSpender(gaugeAddress);
  stakeActions.value.unshift(...approvalActions);
  isLoadingApprovalsForGauge.value = false;
}

function handleClose() {
  isActionConfirmed.value = false;
  confirmationReceipt.value = undefined;
  emit('close');
}
</script>

<template>
  <BalStack vertical>
    <BalStack horizontal spacing="sm" align="center">
      <BalCircle
        v-if="isActionConfirmed"
        size="8"
        color="green"
        class="text-white"
      >
        <BalIcon name="check" />
      </BalCircle>
      <h4>{{ $t(`${action}`) }} {{ $t('lpTokens') }}</h4>
    </BalStack>
    <div
      class="py-2 px-4 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700"
    >
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum2(currentShares) }} {{ $t('lpTokens') }}</h5>
          <span class="text-secondary">
            {{ getToken(pool.address).symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="tokensListExclBpt(pool)"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </div>
    <StakeSummary
      :action="action"
      :fiatValue="fiatValueOfModifiedShares"
      :sharePercentage="totalUserPoolSharePct"
    />
    <BalActionSteps
      v-if="!isActionConfirmed"
      :actions="stakeActions"
      :isLoading="isLoadingApprovalsForGauge"
      :disabled="isStakeAndZero"
      @success="handleSuccess"
    />
    <BalStack v-if="isActionConfirmed && confirmationReceipt" vertical>
      <ConfirmationIndicator :txReceipt="confirmationReceipt" />
      <AnimatePresence :isVisible="isActionConfirmed">
        <BalBtn
          v-if="action === 'stake'"
          color="gradient"
          block
          class="mb-2"
          @click="$router.push({ name: 'claim' })"
        >
          {{ $t('viewClaims') }}
        </BalBtn>
        <BalBtn color="gray" outline block @click="handleClose">
          {{ $t('close') }}
        </BalBtn>
      </AnimatePresence>
    </BalStack>
  </BalStack>
</template>
