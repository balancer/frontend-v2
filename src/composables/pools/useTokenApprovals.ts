import { ref, computed } from 'vue';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { parseUnits } from '@ethersproject/units';
import useTokens from '@/composables/useTokens';
import useNotify from '@/composables/useNotify';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useAllowances from '../useAllowances';
import { TransactionResponse } from '@ethersproject/providers';
import useEthers from '@/composables/useEthers';
import { sleep } from '@/lib/utils';

export default function useTokenApprovals(tokens, shortAmounts) {
  const { getProvider, appNetworkConfig } = useVueWeb3();
  const approving = ref(false);
  const approvedAll = ref(false);
  const { tokens: allTokens } = useTokens();
  const { getRequiredAllowances, refetchAllowances } = useAllowances();
  const { txListener, supportsBlocknative } = useNotify();
  const { txListener: ethersTxListener } = useEthers();

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

  async function blocknativeTxHandler(tx: TransactionResponse): Promise<void> {
    txListener(tx.hash, {
      onTxConfirmed: async () => {
        // REFACTOR: Hack to prevent race condition causing double approvals
        await tx.wait();
        await sleep(5000);
        await refetchAllowances.value();
        // END REFACTOR
        approving.value = false;
      },
      onTxCancel: () => {
        approving.value = false;
      },
      onTxFailed: () => {
        approving.value = false;
      }
    });
  }

  async function ethersTxHandler(tx: TransactionResponse): Promise<void> {
    await ethersTxListener(tx, {
      onTxConfirmed: async () => {
        await refetchAllowances.value();
        approving.value = false;
      },
      onTxFailed: () => {
        approving.value = false;
      }
    });
  }

  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;

      const txs = await approveTokens(
        getProvider(),
        appNetworkConfig.addresses.vault,
        [requiredAllowances.value[0]]
      );

      if (supportsBlocknative.value) {
        blocknativeTxHandler(txs[0]);
      } else {
        ethersTxHandler(txs[0]);
      }
    } catch (error) {
      approving.value = false;
      console.error(error);
    }
  }

  return { requiredAllowances, approveAllowances, approving, approvedAll };
}
