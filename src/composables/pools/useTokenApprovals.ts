import { ref, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';

export type ApprovalState = {
  init: boolean;
  confirming: boolean;
  approved: boolean;
};

export type ApprovalStateMap = {
  [address: string]: ApprovalState;
};

export default function useTokenApprovals(
  tokenAddresses: string[],
  amounts: Ref<string[]>
) {
  /**
   * COMPOSABLES
   */
  const { getProvider, appNetworkConfig } = useWeb3();
  const { tokens, refetchAllowances, approvalsRequired } = useTokens();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * STATE
   */
  const requiredApprovalState = ref<ApprovalStateMap>(
    Object.fromEntries(
      approvalsRequired(tokenAddresses, amounts.value).map(address => [
        address,
        { init: false, confirming: false, approved: false }
      ])
    )
  );

  // Depreciate with new investment flow
  const approving = ref(false);

  /**
   * COMPUTED
   */
  const requiredApprovals = computed(() =>
    approvalsRequired(tokenAddresses, amounts.value)
  );

  /**
   * METHODS
   */
  async function approveToken(address: string): Promise<TransactionResponse> {
    const state = requiredApprovalState.value[address];

    try {
      state.init = true;

      const tx = await sendTransaction(
        getProvider(),
        address,
        ERC20ABI,
        'approve',
        [appNetworkConfig.addresses.vault, MaxUint256.toString()]
      );

      state.init = false;
      state.confirming = true;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveForInvesting', [
          tokens.value[address]?.symbol
        ]),
        details: {
          contractAddress: address,
          spender: appNetworkConfig.addresses.vault
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          await refetchAllowances.value();
          state.confirming = false;
          state.approved = true;
        },
        onTxFailed: () => {
          state.confirming = false;
        }
      });

      return tx;
    } catch (error) {
      state.confirming = false;
      state.init = false;
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * TODO - remove this on transition to new invest flow
   * The old invest flow doesn't work with static initiated state: requiredApprovalState
   */
  async function oldApproveToken(): Promise<boolean> {
    const address = requiredApprovals.value[0];
    let confirmed = false;

    try {
      approving.value = true;

      const tx = await sendTransaction(
        getProvider(),
        address,
        ERC20ABI,
        'approve',
        [appNetworkConfig.addresses.vault, MaxUint256.toString()]
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveForInvesting', [
          tokens.value[address]?.symbol
        ]),
        details: {
          contractAddress: address,
          spender: appNetworkConfig.addresses.vault
        }
      });

      confirmed = await txListener(tx, {
        onTxConfirmed: async () => {
          await refetchAllowances.value();
          approving.value = false;
        },
        onTxFailed: () => {
          approving.value = false;
        }
      });
    } catch (error) {
      approving.value = false;
      console.error(error);
    }

    return confirmed;
  }

  async function approveNextAllowance(): Promise<boolean> {
    return await oldApproveToken();
  }

  return {
    // state
    requiredApprovalState,
    approving,
    // computed
    requiredApprovals,
    // methods
    approveNextAllowance,
    approveToken
  };
}
