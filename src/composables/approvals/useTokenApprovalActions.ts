import { MaxUint256 } from '@ethersproject/constants';
import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useTokenApprovals, {
  ApprovalStateMap,
} from '@/composables/approvals/useTokenApprovals';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

/**
 * TYPES
 */
type ApprovalActionOptions = {
  spender: string;
  amount: string;
  stateMap: ApprovalStateMap;
};

export default function useTokenApprovalActions(
  tokenAddresses: string[],
  amounts: Ref<string[]>,
  forStaking = false
) {
  /**
   * COMPOSABLES
   */
  const { t } = useI18n();
  const { getToken } = useTokens();
  const { vaultApprovalStateMap, approveToken, getApprovalStateMapFor } =
    useTokenApprovals(tokenAddresses, amounts);
  const { appNetworkConfig } = useWeb3();
  const vaultAddress = appNetworkConfig.addresses.vault;

  /**
   * STATE
   */
  // Approval actions based on Vault approvals for tokenAddresses
  const tokenApprovalActions: TransactionActionInfo[] =
    getTokenApprovalActions();

  /**
   * COMPUTED
   */

  /**
   * METHODS
   */
  function actionLabel(address: string, symbol: string): string {
    if (forStaking) {
      return t('transactionSummary.approveForStaking', [symbol]);
    }

    return t(
      address === appNetworkConfig.addresses.veBAL
        ? 'transactionSummary.approveForLocking'
        : 'transactionSummary.approveForInvesting',
      [symbol]
    );
  }

  function actionTooltip(address: string, symbol: string): string {
    if (forStaking) {
      return t('transactionSummary.tooltips.approveForStaking', [symbol]);
    }

    return t(
      address === appNetworkConfig.addresses.veBAL
        ? 'transactionSummary.tooltips.approveForLocking'
        : 'transactionSummary.tooltips.approveForInvesting',
      [symbol]
    );
  }

  async function getTokenApprovalActionsForSpender(
    spender: string,
    amount: string = MaxUint256.toString()
  ) {
    const stateMap = await getApprovalStateMapFor(spender);
    return getTokenApprovalActions({ spender, amount, stateMap });
  }

  function getTokenApprovalActions(
    options: Partial<ApprovalActionOptions> = {}
  ): TransactionActionInfo[] {
    const defaultOptions: ApprovalActionOptions = {
      spender: vaultAddress,
      amount: MaxUint256.toString(),
      stateMap: vaultApprovalStateMap.value,
    };
    const { spender, amount, stateMap } = Object.assign(
      defaultOptions,
      options
    );

    return Object.keys(stateMap).map(address => {
      const token = getToken(address);
      const state = stateMap[address];
      return {
        label: actionLabel(spender, token.symbol),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: actionTooltip(spender, token.symbol),
        action: () => {
          return approveToken(token.address, { spender, state, amount });
        },
      };
    });
  }

  return {
    tokenApprovalActions,
    getTokenApprovalActionsForSpender,
  };
}
