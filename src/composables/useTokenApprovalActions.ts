import { MaxUint256 } from '@ethersproject/constants';
import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useTokenApprovals, {
  ApprovalStateMap,
} from '@/composables/pools/useTokenApprovals';
import useTokens from '@/composables/useTokens';
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
  amounts: Ref<string[]>
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
   * METHODS
   */
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
        },
      };
    });
  }

  return {
    tokenApprovalActions,
    getTokenApprovalActionsForSpender,
  };
}
