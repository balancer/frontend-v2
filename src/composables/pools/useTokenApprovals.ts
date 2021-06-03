import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { parseUnits } from '@ethersproject/units';
import useAuth from '@/composables/useAuth';
import useTokens from '@/composables/useTokens';
import useNotify from '@/composables/useNotify';

export default function useTokenApprovals(tokens, shortAmounts) {
  const auth = useAuth();
  const store = useStore();
  const approving = ref(false);
  const approvedAll = ref(false);
  const { allTokens } = useTokens();
  const { txListener } = useNotify();

  const amounts = computed(() =>
    tokens.map((token, index) => {
      const shortAmount = shortAmounts.value[index] || '0';
      const decimals = allTokens.value[token].decimals;
      const amount = parseUnits(shortAmount, decimals).toString();
      return amount;
    })
  );

  const requiredAllowances = computed(() => {
    const allowances = store.getters['account/getRequiredAllowances']({
      tokens,
      amounts: amounts.value
    });
    return allowances;
  });

  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;
      const txs = await approveTokens(
        auth.web3,
        store.state.web3.config.addresses.vault,
        [requiredAllowances.value[0]]
      );
      const txHashes = txs.map(tx => tx.hash);

      txListener(txHashes, {
        onTxConfirmed: async () => {
          await store.dispatch('account/getAllowances', { tokens });
          approving.value = false;
        },
        onTxCancel: () => {
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
