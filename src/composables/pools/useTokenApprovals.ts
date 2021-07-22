import { ref, computed, Ref } from 'vue';
import { parseUnits } from '@ethersproject/units';

import { approveTokens } from '@/lib/utils/balancer/tokens';

import useWeb3 from '@/services/web3/useWeb3';

import useTokens from '@/composables/useTokens';
import useEthers from '@/composables/useEthers';
import useAllowances from '../useAllowances';
import useTransactions from '../useTransactions';

export default function useTokenApprovals(
  tokenAddresses: string[],
  shortAmounts: Ref<string[]>
) {
  // DATA
  const approving = ref(false);
  const approvedAll = ref(false);

  // COMPOSABLES
  const { getProvider, appNetworkConfig } = useWeb3();
  const { tokens } = useTokens();
  const { getRequiredAllowances, refetchAllowances } = useAllowances();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();

  // COMPUTED
  const amounts = computed(() =>
    tokenAddresses.map((token, index) => {
      const shortAmount = shortAmounts.value[index] || '0';
      const decimals = tokens.value[token].decimals;
      const amount = parseUnits(shortAmount, decimals).toString();
      return amount;
    })
  );

  const requiredAllowances = computed(() => {
    const allowances = getRequiredAllowances({
      tokens: tokenAddresses,
      amounts: amounts.value
    });
    return allowances;
  });

  // METHODS
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
        summary: `${tokens.value[tokenAddress]?.symbol} for investing`,
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
