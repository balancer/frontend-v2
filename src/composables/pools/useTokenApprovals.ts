import { ref, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';

import { tokenService } from '@/services/token/token.service';

import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';
import { getAddress } from '@ethersproject/address';
import { bnum } from '@/lib/utils';

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
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const {
    tokens,
    refetchAllowances,
    approvalsRequired,
    getTokens
  } = useTokens();
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
        appNetworkConfig.addresses.vault
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
      appNetworkConfig.addresses.vault
    )
  );
  /**
   * METHODS
   */
  async function approveToken(
    address: string,
    spender?: string,
    customApprovalState?: Record<string, ApprovalState>
  ): Promise<TransactionResponse> {
    const state = customApprovalState || requiredApprovalState.value[address];

    try {
      state.init = true;

      const tx = await sendTransaction(
        getProvider(),
        address,
        ERC20ABI,
        'approve',
        [spender || appNetworkConfig.addresses.vault, MaxUint256.toString()]
      );

      state.init = false;
      state.confirming = true;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t(
          spender === appNetworkConfig.addresses.veBAL
            ? 'transactionSummary.approveForLocking'
            : 'transactionSummary.approveForInvesting',
          [tokens.value[address]?.symbol]
        ),
        details: {
          contractAddress: address,
          spender: spender || appNetworkConfig.addresses.vault
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

  async function getApprovalForSpender(spender: string) {
    const customTokenMap = getTokens(tokenAddresses);

    const allowances = await tokenService.allowances.get(
      account.value,
      [spender],
      customTokenMap
    );

    const requiredApprovals = tokenAddresses
      .filter((tokenAddress, i) => {
        const allowance = bnum(
          allowances[getAddress(spender)][getAddress(tokenAddress)]
        );
        return allowance.lt(amounts.value[i]);
      })
      .map(tokenAddress => [
        tokenAddress,
        { init: false, confirming: false, approved: false }
      ]);

    const approvalMap = Object.fromEntries(requiredApprovals);
    return approvalMap;
  }

  return {
    // state
    requiredApprovalState,
    approving,
    // computed
    requiredApprovals,
    // methods
    approveToken,
    getApprovalForSpender
  };
}
