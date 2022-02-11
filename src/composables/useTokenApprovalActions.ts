import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokenApprovals, {
  SpenderType
} from '@/composables/pools/useTokenApprovals';
import useTokens from '@/composables/useTokens';
import { TransactionActionInfo } from '@/types/transactions';

export default function useTokenApprovalActions(
  tokenAddresses: string[],
  amounts: Ref<string[]>,
  spenderType?: SpenderType
) {
  const { t } = useI18n();
  const { getToken } = useTokens();
  const { requiredApprovalState, approveToken } = useTokenApprovals(
    tokenAddresses,
    amounts,
    spenderType
  );

  const tokenApprovalActions: TransactionActionInfo[] = Object.keys(
    requiredApprovalState.value
  ).map(address => {
    const token = getToken(address);

    const labels =
      spenderType === 'veBAL'
        ? {
            label: t('transactionSummary.approveForLocking', [token.symbol]),
            loadingLabel: t(
              'getVeBAL.previewModal.actions.approve.loadingLabel'
            ),
            confirmingLabel: t(
              'getVeBAL.previewModal.actions.approve.confirming'
            ),
            stepTooltip: t('getVeBAL.previewModal.actions.approve.tooltip', [
              token.symbol
            ])
          }
        : {
            label: t('transactionSummary.approveForInvesting', [token.symbol]),
            loadingLabel: t('investment.preview.loadingLabel.approval'),
            confirmingLabel: t('confirming'),
            stepTooltip: t('investment.preview.tooltips.approval', [
              token.symbol
            ])
          };

    return {
      ...labels,
      action: () => {
        return approveToken(token.address);
      }
    };
  });

  return {
    tokenApprovalActions
  };
}
