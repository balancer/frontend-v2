import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useTokens from '@/composables/useTokens';
import { TransactionActionInfo } from '@/types/transactions';

export default function useTokenApprovalActions(
  tokenAddresses: string[],
  amounts: Ref<string[]>
) {
  const { t } = useI18n();
  const { getToken } = useTokens();
  const { requiredApprovalState, approveToken } = useTokenApprovals(
    tokenAddresses,
    amounts
  );

  const tokenApprovalActions: TransactionActionInfo[] = Object.keys(
    requiredApprovalState.value
  ).map(address => {
    const token = getToken(address);
    return {
      label: t('transactionSummary.approveForInvesting', [token.symbol]),
      loadingLabel: t('investment.preview.loadingLabel.approval'),
      confirmingLabel: t('confirming'),
      stepTooltip: t('investment.preview.tooltips.approval', [token.symbol]),
      action: () => {
        return approveToken(token.address);
      }
    };
  });

  return {
    tokenApprovalActions
  };
}
