<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { useI18n } from 'vue-i18n';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { bnum, trackLoading } from '@/lib/utils';
import { AnyPool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import useTransactions from '@/composables/useTransactions';
import { fiatValueOf, tokensListExclBpt } from '@/composables/usePoolHelpers';
import StakeSummary from './StakeSummary.vue';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { ApprovalAction } from '@/composables/approvals/types';

/**
 * TYPES
 */
export type StakeAction = 'stake' | 'unstake' | 'restake';
type Props = {
  pool: AnyPool;
  action: StakeAction;
};
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * STATE
 */
const isLoadingApprovalsForGauge = ref(false);
const isActionConfirmed = ref(false);
const confirmationReceipt = ref<TransactionReceipt>();
const stakeActions = ref<TransactionActionInfo[]>([]);

/**
 * COMPOSABLES
 */
const { balanceFor, getToken, refetchBalances } = useTokens();
const { fNum } = useNumbers();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const {
  stake,
  unstake,
  stakedShares,
  refetchAllPoolStakingData,
  preferentialGaugeAddress,
} = usePoolStaking();

// Staked or unstaked shares depending on action type.
const currentShares =
  props.action === 'stake'
    ? balanceFor(getAddress(props.pool.address))
    : stakedShares.value;

const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  ref<string[]>([props.pool.address]),
  ref<string[]>([currentShares]),
  ApprovalAction.Staking
);

const stakeAction = {
  label: t('stake'),
  loadingLabel: t('staking.staking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(stake),
  stepTooltip: t('staking.stakeTooltip'),
};

const unstakeAction = {
  label: t('unstake'),
  loadingLabel: t('staking.unstaking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(unstake),
  stepTooltip:
    props.action === 'restake'
      ? t('staking.restakeTooltip')
      : t('staking.unstakeTooltip'),
};

/**
 * COMPUTED
 */
const assetRowWidth = computed(
  () => (tokensListExclBpt(props.pool).length * 32) / 1.5
);

const isStakeAndZero = computed(
  () =>
    props.action === 'stake' && (currentShares === '0' || currentShares === '')
);

const totalUserPoolSharePct = ref(
  bnum(
    bnum(stakedShares.value).plus(balanceFor(getAddress(props.pool.address)))
  )
    .div(props.pool.totalShares)
    .toString()
);

/**
 * METHODS
 */
async function handleSuccess({ receipt }) {
  isActionConfirmed.value = true;
  confirmationReceipt.value = receipt;
  await Promise.all([refetchBalances(), refetchAllPoolStakingData()]);
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
        pool: props.pool.symbol,
        amount: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
      }),
      details: {
        total: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
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
  const approvalActions = await trackLoading(async () => {
    if (!preferentialGaugeAddress.value) return;
    return await getTokenApprovalActionsForSpender(
      preferentialGaugeAddress.value
    );
  }, isLoadingApprovalsForGauge);

  if (approvalActions) stakeActions.value.unshift(...approvalActions);
}

function handleClose() {
  isActionConfirmed.value = false;
  confirmationReceipt.value = undefined;
  emit('close');
}

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

watch(preferentialGaugeAddress, async () => {
  if (props.action === 'unstake') return;
  await loadApprovalsForGauge();
});

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  if (props.action !== 'unstake') await loadApprovalsForGauge();
});
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
          <h5>{{ fNum(currentShares) }} {{ $t('lpTokens') }}</h5>
          <span class="text-secondary">
            {{ getToken(pool.address)?.symbol }}
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
      :fiatValue="fiatValueOf(pool, currentShares)"
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
