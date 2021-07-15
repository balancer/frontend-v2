import { ref, computed } from 'vue';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { parseUnits } from '@ethersproject/units';
import useTokens from '@/composables/useTokens';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useAllowances from '../useAllowances';
import useEthers from '@/composables/useEthers';
import useTransactions from '../useTransactions';

export default function useTokenApprovals(tokens, shortAmounts) {
  const { getProvider, appNetworkConfig } = useVueWeb3();
  const approving = ref(false);
  const approvedAll = ref(false);
  const { tokens: allTokens } = useTokens();
  const { getRequiredAllowances, refetchAllowances } = useAllowances();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();

  const amounts = computed(() =>
    tokens.map((token, index) => {
      const shortAmount = shortAmounts.value[index] || '0';
      const decimals = allTokens.value[token].decimals;
      const amount = parseUnits(shortAmount, decimals).toString();
      return amount;
    })
  );

  const requiredAllowances = computed(() => {
    const allowances = getRequiredAllowances({
      tokens,
      amounts: amounts.value
    });
    return allowances;
  });

  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;

      const txs = await approveTokens(
        getProvider(),
        appNetworkConfig.addresses.vault,
        [requiredAllowances.value[0]]
      );

      addTransaction({
        id: txs[0].hash,
        type: 'tx',
        action: 'approve',
        summary: allTokens.value[tokens[0]]?.symbol,
        details: {
          tokenAddress: tokens[0],
          amount: amounts.value[0],
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

  return { requiredAllowances, approveAllowances, approving, approvedAll };
}
