import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useTokenApprovals, {
  ApprovalState
} from '@/composables/pools/useTokenApprovals';
import useTokens from '@/composables/useTokens';

import useWeb3 from '@/services/web3/useWeb3';

import { TransactionActionInfo } from '@/types/transactions';
import { MaxUint256 } from '@ethersproject/constants';

export default function useTokenApprovalActions(
  tokenAddresses: string[],
  amounts: Ref<string[]>
) {
  const { t } = useI18n();
  const { getToken } = useTokens();
  const {
    requiredApprovalState,
    approveToken,
    getApprovalForSpender
  } = useTokenApprovals(tokenAddresses, amounts);
  const { appNetworkConfig } = useWeb3();

  const tokenApprovalActions: TransactionActionInfo[] = getTokenApprovalActions();

  /**
   * METHODS
   */
  async function getTokenApprovalActionsForSpender(
    spender: string,
    amount: string = MaxUint256.toString()
  ) {
    const requiredApprovalStateForSpender = await getApprovalForSpender(
      spender
    );
    const actions = getTokenApprovalActions(
      requiredApprovalStateForSpender,
      spender,
      amount
    );
    return actions;
  }

  function getTokenApprovalActions(
    customApprovalState?: Record<string, ApprovalState>,
    spender: string = appNetworkConfig.addresses.vault,
    amount: string = MaxUint256.toString()
  ): TransactionActionInfo[] {
    const approvalStates = customApprovalState || requiredApprovalState.value;

    return Object.keys(approvalStates).map(address => {
      const token = getToken(address);
      const state = approvalStates[address];
      return {
        label: t(
          spender === appNetworkConfig.addresses.veBAL
            ? 'transactionSummary.approveForLocking'
            : 'transactionSummary.approveForInvesting',
          [token.symbol]
        ),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: t('investment.preview.tooltips.approval', [token.symbol]),
        action: () => {
          return approveToken(token.address, { spender, state, amount });
        }
      };
    });
  }

  return {
    tokenApprovalActions,
    getTokenApprovalActionsForSpender
  };
}
