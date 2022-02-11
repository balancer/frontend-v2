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

export type SpenderType = 'vault' | 'veBAL';

export default function useTokenApprovals(
  tokenAddresses: string[],
  amounts: Ref<string[]>,
  spenderType?: SpenderType
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
      approvalsRequired(
        tokenAddresses,
        amounts.value,
        spenderType === 'veBAL'
          ? appNetworkConfig.addresses.veBAL
          : appNetworkConfig.addresses.vault
      ).map(address => [
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
    approvalsRequired(
      tokenAddresses,
      amounts.value,
      spenderType === 'veBAL'
        ? appNetworkConfig.addresses.veBAL
        : appNetworkConfig.addresses.vault
    )
  );

  /**
   * METHODS
   */
  async function approveToken(address: string): Promise<TransactionResponse> {
    const state = requiredApprovalState.value[address];

    try {
      state.init = true;

      const spender =
        spenderType === 'veBAL'
          ? appNetworkConfig.addresses.veBAL
          : appNetworkConfig.addresses.vault;

      const tx = await sendTransaction(
        getProvider(),
        address,
        ERC20ABI,
        'approve',
        [spender, MaxUint256.toString()]
      );

      state.init = false;
      state.confirming = true;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t(
          spenderType === 'veBAL'
            ? 'transactionSummary.approveForLocking'
            : 'transactionSummary.approveForInvesting',
          [tokens.value[address]?.symbol]
        ),
        details: {
          contractAddress: address,
          spender
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

  return {
    // state
    requiredApprovalState,
    approving,
    // computed
    requiredApprovals,
    // methods
    approveToken
  };
}
