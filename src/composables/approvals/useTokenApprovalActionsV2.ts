import { MaxUint256 } from '@ethersproject/constants';
import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { ApprovalAction } from './types';
import { getAddress } from '@ethersproject/address';
import { bnum, findByAddress } from '@/lib/utils';
import TokenService from '@/services/token/token.service';

/**
 * TYPES
 */
export type AmountToApprove = {
  address: string;
  amount: string;
};

export type ApprovalState = {
  init: boolean;
  confirming: boolean;
  approved: boolean;
};

export type ApprovalStateMap = {
  [address: string]: ApprovalState;
};

// type ApprovalActionOptions = {
//   spender: string;
//   amount: string;
//   stateMap: ApprovalStateMap;
// };

export default function useTokenApprovalActionsV2(
  amountsToApprove: Ref<AmountToApprove[]>,
  spender: string,
  actionType: ApprovalAction = ApprovalAction.AddLiquidity
) {
  /**
   * COMPOSABLES
   */
  const { refetchAllowances, approvalsRequired, getToken } = useTokens();
  const { t } = useI18n();

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

  async function getApprovalsRequired(): Promise<string[]> {
    await refetchAllowances();
    const tokenAddresses = amountsToApprove.value.map(ata => ata.address);
    const amounts = amountsToApprove.value.map(ata => ata.amount);
    return approvalsRequired(tokenAddresses, amounts, spender);
  }

  async function getTokenApprovalActions(): Promise<TransactionActionInfo[]> {
    const approvalsRequired = await getApprovalsRequired();

    return approvalsRequired.map(address => {
      const token = TokenService.getTokenByAddress(address);
      const amountToApprove = findByAddress(amountsToApprove.value, address);

      return {
        label: actionLabel(token.symbol),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: actionTooltip(token.symbol),
        // action: () => Promise<TransactionResponse>;
        // postActionValidation?: () => Promise<boolean>;
      }
    }
  }
}
