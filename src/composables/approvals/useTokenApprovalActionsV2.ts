import { MaxUint256 } from '@ethersproject/constants';
import { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { ApprovalAction } from './types';
import { findByAddress } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { TokenInfo } from '@/types/TokenList';
import { parseUnits } from '@ethersproject/units';
import { TransactionResponse } from '@ethersproject/providers';
import useTransactions from '../useTransactions';

/**
 * TYPES
 */
export type AmountToApprove = {
  address: string;
  amount: string; // normalized amount
};

interface Params {
  amountsToApprove: Ref<AmountToApprove[]>;
  spender: string;
  actionType?: ApprovalAction;
  forceMaxApprovals?: boolean;
}

export default function useTokenApprovalActionsV2({
  amountsToApprove,
  spender,
  actionType = ApprovalAction.AddLiquidity,
  forceMaxApprovals = true,
}: Params) {
  /**
   * COMPOSABLES
   */
  const { refetchAllowances, approvalsRequired, approvalRequired, getToken } =
    useTokens();
  const { t } = useI18n();
  const { getSigner } = useWeb3();
  const { addTransaction } = useTransactions();

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

  function summaryLabel(address: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return t('transactionSummary.approveForLocking', [
          getToken(address)?.symbol,
        ]);
      case ApprovalAction.Staking:
        return t('transactionSummary.approveForStaking', [
          getToken(address)?.symbol,
        ]);
      default:
        return t('transactionSummary.approveForInvesting', [
          getToken(address)?.symbol,
        ]);
    }
  }

  async function approveToken(
    normalAmount: string,
    token: TokenInfo
  ): Promise<TransactionResponse> {
    const amount = forceMaxApprovals
      ? MaxUint256.toString()
      : parseUnits(normalAmount, token.decimals).toString();

    const txBuilder = new TransactionBuilder(getSigner());
    const tx = await txBuilder.contract.sendTransaction({
      contractAddress: token.address,
      abi: [
        'function approve(address spender, uint256 amount) public returns (bool)',
      ],
      action: 'approve',
      params: [spender, amount],
    });

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: summaryLabel(token.address),
      details: {
        contractAddress: token.address,
        spender: spender,
      },
    });

    return tx;
  }

  async function getApprovalsRequired(): Promise<string[]> {
    await refetchAllowances();
    const tokenAddresses = amountsToApprove.value.map(ata => ata.address);
    const amounts = amountsToApprove.value.map(ata => ata.amount);
    return approvalsRequired(tokenAddresses, amounts, spender);
  }

  async function isApprovalValid(
    amountToApprove: AmountToApprove
  ): Promise<boolean> {
    await refetchAllowances();
    return !approvalRequired(
      amountToApprove.address,
      amountToApprove.amount,
      spender
    );
  }

  async function getTokenApprovalActions(): Promise<TransactionActionInfo[]> {
    const approvalsRequired = await getApprovalsRequired();

    return approvalsRequired.map(address => {
      const token = getToken(address);
      const amountToApprove = findByAddress(
        amountsToApprove.value,
        address
      ) as AmountToApprove;

      return {
        label: actionLabel(token.symbol),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: actionTooltip(token.symbol),
        action: () => approveToken(amountToApprove.amount, token),
        postActionValidation: () => isApprovalValid(amountToApprove),
        actionInvalidReason: {
          title: 'Approval insufficient',
          description:
            "Approved amount isn't enough to cover the transaction, please try again.",
        },
      };
    });
  }

  return {
    getTokenApprovalActions,
  };
}
