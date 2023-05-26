import { ApprovalAction } from '@/composables/approvals/types';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { fiatValueOf } from '@/composables/usePoolHelpers';
import useTransactions from '@/composables/useTransactions';
import { trackLoading } from '@/lib/utils';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { useTokens } from '@/providers/tokens.provider';
import { AnyPool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { useI18n } from 'vue-i18n';

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
    restake,
    stakedShares,
    refetchAllPoolStakingData,
    preferentialGaugeAddress,
    isLoading,
  } = usePoolStaking();
  //TODO: this is only used for restake (better not always calling it)
  const { relayerSignature, relayerApprovalAction } = useRelayerApproval(
    RelayerType.BATCH
  );

  // console.log('preferentialGaugeAddress', preferentialGaugeAddress);

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
    action: () => txWithNotification(stake, 'stake'),
    stepTooltip: t('staking.stakeTooltip'),
  };

  const unstakeAction = {
    label: t('unstake'),
    loadingLabel: t('staking.unstaking'),
    confirmingLabel: t('confirming'),
    action: () => txWithNotification(unstake, 'unstake'),
    stepTooltip: t('staking.unstakeTooltip'),
  };

  const restakeAction = {
    label: t('restake'),
    loadingLabel: t('staking.unstaking'),
    confirmingLabel: t('confirming'),
    action: () => txWithNotification(restake, 'restake'),
    stepTooltip: t('staking.restakeTooltip'),
  };

  // /**
  //  * COMPUTED
  //  */
  // const assetRowWidth = computed(
  //   () => (tokensListExclBpt(props.pool).length * 32) / 1.5
  // );

  // const isStakeAndZero = computed(
  //   () =>
  //     props.action === 'stake' &&
  //     (currentShares === '0' || currentShares === '')
  // );

  // const totalUserPoolSharePct = ref(
  //   bnum(
  //     bnum(stakedShares.value).plus(balanceFor(getAddress(props.pool.address)))
  //   )
  //     .div(props.pool.totalShares)
  //     .toString()
  // );

  /**
   * METHODS
   */
  async function handleSuccess({ receipt }) {
    isActionConfirmed.value = true;
    confirmationReceipt.value = receipt;
    await Promise.all([refetchBalances(), refetchAllPoolStakingData()]);
    emit('success');
  }

  async function txWithNotification(
    action: () => Promise<TransactionResponse>,
    actionType: StakeAction
  ) {
    try {
      const tx = await action();
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
      throw new Error(`Failed create ${actionType} transaction`, {
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

  // async function loadApprovalsForRestake() {
  //   const { relayerSignature, relayerApprovalAction } = useRelayerApproval(
  //     RelayerType.BATCH
  //   );
  //   if (relayerApprovalAction)
  //     stakeActions.value.unshift(relayerApprovalAction.value);
  // }

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
        // What if relayerApprovalAction.value is not loaded?
        stakeActions.value = [relayerApprovalAction.value, restakeAction];
    },
    { immediate: true }
  );

  watch(preferentialGaugeAddress, async () => {
    if (props.action === 'stake') await loadApprovalsForGauge();
    // if (props.action === 'restake') await loadApprovalsForRestake();
  });

  /**
   * LIFECYCLE
   */
  onBeforeMount(async () => {
    if (props.action === 'stake') await loadApprovalsForGauge();
    // if (props.action === 'restake') await loadApprovalsForRestake();
  });

  return { handleSuccess, handleClose, getToken, stakeActions };
}
