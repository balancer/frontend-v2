import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { MaxUint256 } from '@ethersproject/constants';
import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useEthers from '@/composables/useEthers';
import { useTokens } from '@/providers/tokens.provider';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';
import { bnum } from '@/lib/utils';
import TokenService from '@/services/token/token.service';
import useWeb3 from '@/services/web3/useWeb3';

import useTransactions from '../useTransactions';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { ApprovalAction } from './types';

export type ApprovalState = {
  init: boolean;
  confirming: boolean;
  approved: boolean;
};

export type ApprovalStateMap = {
  [address: string]: ApprovalState;
};

export type ApprovalOptions = {
  spender: string;
  amount: string;
  state: ApprovalState;
};

export default function useTokenApprovals(
  tokenAddresses: Ref<string[]>,
  amounts: Ref<string[]>,
  actionType: ApprovalAction = ApprovalAction.AddLiquidity
) {
  /**
   * COMPOSABLES
   */
  const { getSigner, appNetworkConfig, account } = useWeb3();
  const { getToken, refetchAllowances, approvalsRequired, getTokens } =
    useTokens();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * STATE
   */
  const vaultApprovalStateMap = computed(
    (): ApprovalStateMap =>
      Object.fromEntries(
        approvalsRequired(
          tokenAddresses.value,
          amounts.value,
          appNetworkConfig.addresses.vault
        ).map(address => [
          address,
          { init: false, confirming: false, approved: false },
        ])
      )
  );

  // Depreciate with new investment flow
  const approving = ref(false);

  /**
   * COMPUTED
   */
  const requiredApprovals = computed(() =>
    approvalsRequired(
      tokenAddresses.value,
      amounts.value,
      appNetworkConfig.addresses.vault
    )
  );

  /**
   * METHODS
   */
  function txSummaryLabel(address: string): string {
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
    address: string,
    options: Partial<ApprovalOptions> = {}
  ): Promise<TransactionResponse> {
    const defaultOptions: ApprovalOptions = {
      spender: appNetworkConfig.addresses.vault,
      amount: MaxUint256.toString(),
      state: vaultApprovalStateMap.value[address],
    };
    const { spender, amount, state } = Object.assign(defaultOptions, options);

    try {
      state.init = true;

      const txBuilder = new TransactionBuilder(getSigner());
      const tx = await txBuilder.contract.sendTransaction({
        contractAddress: address,
        abi: ERC20ABI,
        action: 'approve',
        params: [spender, amount],
      });

      state.init = false;
      state.confirming = true;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: txSummaryLabel(address),
        details: {
          contractAddress: address,
          spender: spender,
        },
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          await refetchAllowances();
          state.confirming = false;
          state.approved = true;
        },
        onTxFailed: () => {
          state.confirming = false;
        },
      });

      return tx;
    } catch (error) {
      state.confirming = false;
      state.init = false;
      console.error(error);
      return Promise.reject(error);
    }
  }

  async function getApprovalStateMapFor(
    spender: string
  ): Promise<ApprovalStateMap> {
    const customTokenMap = getTokens(tokenAddresses.value);

    const allowances = await new TokenService().allowances.get(
      account.value,
      [spender],
      customTokenMap
    );

    const requiredApprovals = tokenAddresses.value
      .filter((tokenAddress, i) => {
        const allowance = bnum(
          allowances[getAddress(spender)][getAddress(tokenAddress)]
        );
        return allowance.lt(amounts.value[i]);
      })
      .map(tokenAddress => [
        tokenAddress,
        { init: false, confirming: false, approved: false },
      ]);

    const approvalMap = Object.fromEntries(requiredApprovals);
    return approvalMap;
  }

  return {
    // state
    vaultApprovalStateMap,
    approving,
    // computed
    requiredApprovals,
    // methods
    approveToken,
    getApprovalStateMapFor,
  };
}
