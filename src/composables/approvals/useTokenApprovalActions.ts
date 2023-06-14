import { MaxUint256 } from '@ethersproject/constants';
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
  amountsToApprove: AmountToApprove[];
  spender: string;
  actionType: ApprovalAction;
  forceMax?: boolean;
}

interface ApproveTokenParams {
  token: TokenInfo;
  normalizedAmount: string;
  spender: string;
  actionType: ApprovalAction;
  forceMax?: boolean;
}

export default function useTokenApprovalActions() {
  /**
   * COMPOSABLES
   */
  const { refetchAllowances, approvalsRequired, approvalRequired, getToken } =
    useTokens();
  const { t } = useI18n();
  const { getSigner } = useWeb3();
  const { addTransaction } = useTransactions();

  /**
   * METHODS
   */
  function actionLabel(actionType: ApprovalAction, symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return t('transactionSummary.approveForLocking', [symbol]);
      case ApprovalAction.Staking:
        return t('transactionSummary.approveForStaking', [symbol]);
      default:
        return t('transactionSummary.approveForInvesting', [symbol]);
    }
  }

  function actionTooltip(actionType: ApprovalAction, symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return t('transactionSummary.tooltips.approveForLocking', [symbol]);
      case ApprovalAction.Staking:
        return t('transactionSummary.tooltips.approveForStaking', [symbol]);
      default:
        return t('transactionSummary.tooltips.approveForInvesting', [symbol]);
    }
  }

  function summaryLabel(actionType: ApprovalAction, address: string): string {
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

  async function getApprovalsRequired(
    amountsToApprove: AmountToApprove[],
    spender: string
  ): Promise<string[]> {
    await refetchAllowances();
    const tokenAddresses = amountsToApprove.map(ata => ata.address);
    const amounts = amountsToApprove.map(ata => ata.amount);
    return approvalsRequired(tokenAddresses, amounts, spender);
  }

  async function isApprovalValid(
    amountToApprove: AmountToApprove,
    spender: string
  ): Promise<boolean> {
    await refetchAllowances();
    return !approvalRequired(
      amountToApprove.address,
      amountToApprove.amount,
      spender
    );
  }

  /**
   * Triggers ERC20 approval transaction for a given token, waits for
   * confirmation and then triggers the transaction notification.
   *
   * @param {TokenInfo} token The token to approve.
   * @param {string} normalizedAmount The amount to approve, normalized, if
   * forceMax is false.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling of tx notification.
   * @param {boolean} forceMax If true, the approval will be for the maximum
   * possible amount.
   * @returns {Promise<TransactionResponse>} The transaction response.
   */
  async function approveToken({
    token,
    normalizedAmount,
    spender,
    actionType,
    forceMax = true,
  }: ApproveTokenParams): Promise<TransactionResponse> {
    const amount = forceMax
      ? MaxUint256.toString()
      : parseUnits(normalizedAmount, token.decimals).toString();

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
      summary: summaryLabel(actionType, token.address),
      details: {
        contractAddress: token.address,
        spender: spender,
      },
    });

    return tx;
  }

  /**
   * Returns a list of TransactionActions to approve tokens for a given spender.
   * Typically used to inject into BalActionSteps.
   *
   * @param {AmountToApprove[]} amountsToApprove The list of tokens and amounts
   * to approve.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling.
   * @param {boolean} forceMaxApprovals If true, the approval will be for the
   * maximum possible amount.
   * @returns {Promise<TransactionActionInfo[]>} The list of TransactionActions.
   */
  async function getTokenApprovalActions({
    amountsToApprove,
    spender,
    actionType,
    forceMax = true,
  }: Params): Promise<TransactionActionInfo[]> {
    const approvalsRequired = await getApprovalsRequired(
      amountsToApprove,
      spender
    );

    return approvalsRequired.map(address => {
      const token = getToken(address);
      const amountToApprove = findByAddress(
        amountsToApprove,
        address
      ) as AmountToApprove;

      return {
        label: actionLabel(actionType, token.symbol),
        loadingLabel: t('investment.preview.loadingLabel.approval'),
        confirmingLabel: t('confirming'),
        stepTooltip: actionTooltip(actionType, token.symbol),
        action: () =>
          approveToken({
            token,
            normalizedAmount: amountToApprove.amount,
            spender,
            actionType,
            forceMax,
          }),
        postActionValidation: () => isApprovalValid(amountToApprove, spender),
        actionInvalidReason: {
          title: t('actionSteps.approve.invalidReason.title'),
          description: t('actionSteps.approve.invalidReason.description'),
        },
      };
    });
  }

  return {
    approveToken,
    getTokenApprovalActions,
  };
}
