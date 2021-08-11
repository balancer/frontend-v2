import { ref, computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';

export default function useTokenApprovals(
  tokenAddresses: string[],
  amounts: Ref<string[]>
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approvedAll = ref(false);

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
  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;
      const tokenAddress = requiredAllowances.value[0];

      const txs = await approveTokens(
        getProvider(),
        appNetworkConfig.addresses.vault,
        [tokenAddress]
      );

      addTransaction({
        id: txs[0].hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveForInvesting', [
          tokens.value[tokenAddress]?.symbol
        ]),
        details: {
          tokenAddress,
          spender: appNetworkConfig.addresses.vault
        }
      });

      txListener(txs[0], {
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

  return {
    // data
    approving,
    approvedAll,
    // computed
    requiredAllowances,
    // methods
    approveAllowances
  };
}
