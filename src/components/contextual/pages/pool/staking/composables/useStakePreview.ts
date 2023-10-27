import { ApprovalAction } from '@/composables/approvals/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { fiatValueOf } from '@/composables/usePoolHelpers';
import useTransactions from '@/composables/useTransactions';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { useTokens } from '@/providers/tokens.provider';
import { bnum, trackLoading } from '@/lib/utils';
import { AnyPool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { useI18n } from 'vue-i18n';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';

/**
 * TYPES
 */
export type StakeAction = 'stake' | 'unstake' | 'restake';
export type StakePreviewProps = {
  pool: AnyPool;
  action: StakeAction;
};

export function useStakePreview(props: StakePreviewProps, emit) {
  /**
   * STATE
   */
  const isLoadingApprovalsForGauge = ref(false);
  const isActionConfirmed = ref(false);
  const isActionConfirming = ref(false);
  const confirmationReceipt = ref<TransactionReceipt>();
  const stakeActions = ref<TransactionActionInfo[]>([]);

  /**
   * COMPOSABLES
   */
  const { balanceFor, refetchBalances } = useTokens();
  const { fNum } = useNumbers();
  const { t } = useI18n();
  const { addTransaction } = useTransactions();
  const { getTokenApprovalActions } = useTokenApprovalActions();
  const {
    isLoading: isPoolStakingLoading,
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

  const stakeAction = {
    label: t('stake'),
    loadingLabel: t('staking.staking'),
    confirmingLabel: t('confirming'),
    action: () => txWithNotification(stake, 'stake'),
    stepTooltip: t('staking.stakeTooltip'),
  };

  const unstakeAction = {
    label: t('unstake'),
    loadingLabel: t('staking.unstaking'),
    confirmingLabel: t('confirming'),
    action: () => txWithNotification(unstake, 'unstake'),
    stepTooltip:
      props.action === 'restake'
        ? t('staking.restakeTooltip')
        : t('staking.unstakeTooltip'),
  };

  /**
   * COMPUTED
   */
  const isStakeAndZero = computed(
    () =>
      props.action === 'stake' &&
      (currentShares === '0' || currentShares === '')
  );

  const totalUserPoolSharePct = ref(
    bnum(
      bnum(stakedShares.value).plus(balanceFor(getAddress(props.pool.address)))
    )
      .div(props.pool.totalShares)
      .toString()
  );

  const amountsToApprove = computed(() => [
    {
      address: props.pool.address,
      amount: currentShares,
    },
  ]);

  const isLoading = computed(
    () => isLoadingApprovalsForGauge.value || isPoolStakingLoading.value
  );

  /**
   * METHODS
   */
  async function txWithNotification(
    action: () => Promise<TransactionResponse>,
    actionType: StakeAction
  ) {
    try {
      const tx = await action();
      isActionConfirming.value = true;
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: actionType,
        summary: t(`transactionSummary.${actionType}`, {
          pool: props.pool.symbol,
          amount: fNum(
            fiatValueOf(props.pool, currentShares),
            FNumFormats.fiat
          ),
        }),
        details: {
          total: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
          pool: props.pool,
        },
      });
      return tx;
    } catch (error) {
      isActionConfirming.value = false;
      throw new Error(`Failed create ${actionType} transaction`, {
        cause: error,
      });
    }
  }

  async function loadApprovalsForGauge() {
    const approvalActions = await trackLoading(async () => {
      if (!preferentialGaugeAddress.value) return;

      return await getTokenApprovalActions({
        amountsToApprove: amountsToApprove.value,
        spender: preferentialGaugeAddress.value,
        actionType: ApprovalAction.Staking,
      });
    }, isLoadingApprovalsForGauge);

    if (approvalActions) stakeActions.value.unshift(...approvalActions);
  }

  async function handleSuccess(receipt: TransactionReceipt) {
    isActionConfirmed.value = true;
    isActionConfirming.value = false;
    confirmationReceipt.value = receipt;
    await Promise.all([refetchBalances(), refetchAllPoolStakingData()]);
    emit('success');
  }

  function handleClose() {
    isActionConfirmed.value = false;
    isActionConfirming.value = false;
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
      if (props.action === 'unstake') {
        stakeActions.value = [unstakeAction];
      }
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

  return {
    //state
    isActionConfirmed,
    isActionConfirming,
    confirmationReceipt,
    isLoading,
    currentShares,
    stakeActions,
    totalUserPoolSharePct,
    //methods
    handleSuccess,
    handleClose,
    isStakeAndZero,
  };
}
