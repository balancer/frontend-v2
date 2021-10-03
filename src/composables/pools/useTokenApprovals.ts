import { ref, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';
import { MaxUint256 } from '@ethersproject/constants';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';

export default function useTokenApprovals(
  tokenAddresses: string[],
  amounts: Ref<string[]>
) {
  /**
   * STATE
   */
  const approving = ref(false);

  /**
   * COMPOSABLES
   */
  const { getProvider, appNetworkConfig } = useWeb3();
  const { tokens, refetchAllowances, approvalsRequired } = useTokens();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * COMPUTED
   */
  const requiredAllowances = computed(() =>
    approvalsRequired(tokenAddresses, amounts.value)
  );

  /**
   * METHODS
   */
  async function approveToken(address: string): Promise<void> {
    try {
      approving.value = true;

      const tx = await sendTransaction(
        getProvider(),
        address,
        ERC20ABI,
        'approve',
        [[appNetworkConfig.addresses.vault, MaxUint256.toString()]]
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

      txListener(tx, {
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
  }

  async function approveNextAllowance(): Promise<void> {
    return await approveToken(requiredAllowances.value[0]);
  }

  return {
    // data
    approving,
    // computed
    requiredAllowances,
    // methods
    approveNextAllowance
  };
}
