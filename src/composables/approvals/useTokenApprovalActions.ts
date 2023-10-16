import { MaxUint256 } from '@ethersproject/constants';
import { useI18n } from 'vue-i18n';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { ApprovalAction } from './types';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { TokenInfo } from '@/types/TokenList';
import { parseUnits } from '@ethersproject/units';
import { TransactionResponse } from '@ethersproject/providers';
import useTransactions from '../useTransactions';
import { configService } from '@/services/config/config.service';
import { flatten } from 'lodash';
import { bnum } from '@/lib/utils';

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
  skipAllowanceCheck?: boolean;
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
  const {
    refetchAllowances,
    approvalsRequired,
    approvalRequired,
    getToken,
    injectSpenders,
    allowanceFor,
  } = useTokens();
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
      case ApprovalAction.Swapping:
        return t('transactionSummary.approveForSwapping', [symbol]);
      case ApprovalAction.Unapprove:
        return t('transactionSummary.unapprove', [symbol]);
      case ApprovalAction.Unwrapping:
        return t('transactionSummary.approveForUnwrapping', [symbol]);
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
      case ApprovalAction.Swapping:
        return t('transactionSummary.tooltips.approveForSwapping', [symbol]);
      case ApprovalAction.Unapprove:
        return t('transactionSummary.tooltips.unapprove', [symbol]);
      case ApprovalAction.Unwrapping:
        return t('transactionSummary.tooltips.approveForUnwrapping', [symbol]);
      default:
        return t('transactionSummary.tooltips.approveForInvesting', [symbol]);
    }
  }

  async function updateAllowancesFor(spender: string): Promise<void> {
    await injectSpenders([spender]);
    await refetchAllowances();
  }

  async function getApprovalsRequired(
    amountsToApprove: AmountToApprove[],
    spender: string,
    skipAllowanceCheck = false
  ): Promise<AmountToApprove[]> {
    if (!skipAllowanceCheck) {
      await updateAllowancesFor(spender);
    }

    return approvalsRequired(amountsToApprove, spender);
  }

  async function isApprovalValid(
    amountToApprove: AmountToApprove,
    spender: string
  ): Promise<boolean> {
    if (bnum(amountToApprove.amount).eq(0)) return true;

    await updateAllowancesFor(spender);

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
      summary: actionLabel(actionType, token.symbol),
      details: {
        contractAddress: token.address,
        spender: spender,
      },
    });

    return tx;
  }

  /**
   * Some tokens require setting their approval amount to 0 first before being
   * able to adjust the value up again. This returns true for tokens that requires
   * this and false otherwise.
   */
  function isDoubleApprovalRequired(token, spender): boolean {
    return !!(
      configService.network.tokens.DoubleApprovalRequired?.includes(
        token.address
      ) && allowanceFor(token.address, spender).gt(0)
    );
  }

  /**
   * Create an action for BalActionSteps that approves a token for spending.
   * @param {TokenInfo} token The token to approve.
   * @param {string} normalizedAmount The amount to approve, normalized, if
   * forceMax is false.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling of tx notification.
   * @param {boolean} forceMax If true, the approval will be for the maximum
   * possible amount.
   * @returns {TransactionActionInfo} The transaction
   */
  function createApprovalAction({
    token,
    normalizedAmount,
    spender,
    actionType,
    forceMax = true,
  }: ApproveTokenParams): TransactionActionInfo {
    return {
      label: actionLabel(actionType, token.symbol),
      loadingLabel: t('investment.preview.loadingLabel.approval'),
      confirmingLabel: t('confirming'),
      stepTooltip: actionTooltip(actionType, token.symbol),
      action: () => {
        return approveToken({
          token,
          normalizedAmount,
          spender,
          actionType,
          forceMax,
        });
      },
      postActionValidation: () => {
        return isApprovalValid(
          { address: token.address, amount: normalizedAmount },
          spender
        );
      },
      actionInvalidReason: {
        title: t('actionSteps.approve.invalidReason.title'),
        description: t('actionSteps.approve.invalidReason.description'),
      },
    };
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
    skipAllowanceCheck = false,
  }: Params): Promise<TransactionActionInfo[]> {
    const approvalsRequired = await getApprovalsRequired(
      amountsToApprove,
      spender,
      skipAllowanceCheck
    );

    return flatten(
      approvalsRequired.map(amountToApprove => {
        const token = getToken(amountToApprove.address);
        const actions: TransactionActionInfo[] = [];

        /**
         * Some tokens require setting approved amount to 0 before changing the
         * approval amount. This injects another action to do that.
         */
        if (isDoubleApprovalRequired(token, spender)) {
          actions.push(
            createApprovalAction({
              token,
              normalizedAmount: '0',
              spender,
              actionType: ApprovalAction.Unapprove,
              forceMax: false,
            })
          );
        }

        actions.push(
          createApprovalAction({
            token,
            normalizedAmount: amountToApprove.amount,
            spender,
            actionType,
            forceMax,
          })
        );

        return actions;
      })
    );
  }

  return {
    approveToken,
    getTokenApprovalActions,
    updateAllowancesFor,
  };
}
