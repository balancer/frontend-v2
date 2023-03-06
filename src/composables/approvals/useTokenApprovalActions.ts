import { MaxUint256 } from '@ethersproject/constants';
import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useTokenApprovals, {
  ApprovalStateMap,
} from '@/composables/approvals/useTokenApprovals';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { ApprovalAction } from './types';

/**
 * TYPES
 */
type ApprovalActionOptions = {
  spender: string;
  amount: string;
  stateMap: ApprovalStateMap;
};

export default function useTokenApprovalActions(
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  actionType: ApprovalAction = ApprovalAction.AddLiquidity
) {
  /**
   * COMPOSABLES
   */
  const { t } = useI18n();
  const { getToken } = useTokens();
  const { vaultApprovalStateMap, approveToken, getApprovalStateMapFor } =
    useTokenApprovals(tokenAddresses, amounts, actionType);
  const { appNetworkConfig } = useWeb3();
  const vaultAddress = appNetworkConfig.addresses.vault;

  /**
   * STATE
   */
  // Approval actions based on Vault approvals for tokenAddresses
  const tokenApprovalActions: TransactionActionInfo[] =
    getTokenApprovalActions();

  /**
   * METHODS
   */
  function actionLabel(symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return t('transactionSummary.approveForLocking', [symbol]);
      case ApprovalAction.Staking:
        return t('transactionSummary.approveForStaking', [symbol]);
      default:
        return t('transactionSummary.approveForInvesting', [symbol]);
    }
  }

  function actionTooltip(symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return t('transactionSummary.tooltips.approveForLocking', [symbol]);
      case ApprovalAction.Staking:
        return t('transactionSummary.tooltips.approveForStaking', [symbol]);
      default:
        return t('transactionSummary.tooltips.approveForInvesting', [symbol]);
    }
  }

  async function getTokenApprovalActionsForSpender(
    spender: string,
    amount: string = MaxUint256.toString()
  ) {
    const stateMap = await getApprovalStateMapFor(spender);
    return getTokenApprovalActions({ spender, amount, stateMap });
  }

  async function fetchTokenApprovalActions(
    spender: string
  ): Promise<TransactionActionInfo[]> {
    const stateMap = await getApprovalStateMapFor(spender);
    return getTokenApprovalActions({ stateMap });
  }

  // Approval actions based on Vault approvals for tokenAddresses
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
        label: actionLabel(token.symbol),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: actionTooltip(token.symbol),
        action: () => {
          return approveToken(token.address, { spender, state, amount });
        },
      };
    });
  }

  return {
    tokenApprovalActions,
    getTokenApprovalActions,
    getTokenApprovalActionsForSpender,
    fetchTokenApprovalActions,
  };
}
