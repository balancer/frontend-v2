import { Ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokenApprovals, {
  ApprovalState
} from '@/composables/pools/useTokenApprovals';
import useTokens from '@/composables/useTokens';
import { StepState, Action } from '@/types';

export default function useTokenApprovalActions(
  tokenAddresses: string[],
  amounts: Ref<string[]>,
  currentActionIndex: Ref<number>
) {
  const { t } = useI18n();
  const { getToken } = useTokens();
  const { requiredApprovalState, approveToken } = useTokenApprovals(
    tokenAddresses,
    amounts
  );

  const allApproved = computed((): boolean =>
    Object.values(requiredApprovalState.value).every(state => state.approved)
  );

  function approvalStepState(state: ApprovalState, index: number): StepState {
    if (state.confirming) {
      return StepState.Pending;
    } else if (state.init) {
      return StepState.WalletOpen;
    } else if (!state.approved && index === currentActionIndex.value) {
      return StepState.Active;
    } else if (state.approved) {
      return StepState.Success;
    } else {
      return StepState.Todo;
    }
  }

  const tokenApprovalActions = computed((): Action[] => {
    return Object.keys(requiredApprovalState.value).map((address, i) => {
      const token = getToken(address);
      const state = requiredApprovalState.value[address];
      return {
        label: t('transactionSummary.approveForInvesting', [token.symbol]),
        loadingLabel: state.init
          ? t('investment.preview.loadingLabel.approval')
          : t('confirming'),
        pending: state.init || state.confirming,
        promise: async () => {
          const confirmed = await approveToken(token.address);
          if (confirmed) currentActionIndex.value += 1;
        },
        step: {
          tooltip: t('investment.preview.tooltips.approval', [token.symbol]),
          state: approvalStepState(state, i)
        }
      };
    });
  });

  return {
    allApproved,
    tokenApprovalActions
  }

}