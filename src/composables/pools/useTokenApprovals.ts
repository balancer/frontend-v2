import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { approveTokens } from '@/utils/balancer/tokens';
import { parseUnits } from '@ethersproject/units';
import useAuth from '@/composables/useAuth';

export default function useTokenApprovals(tokens, shortAmounts) {
  const auth = useAuth();
  const store = useStore();
  const approving = ref(false);
  const approvedAll = ref(false);

  const allTokens = computed(() => store.getters['registry/getTokens']());

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
        requiredAllowances.value
      );
      console.log(txs);
      await Promise.all(txs.map(tx => tx.wait()));
      approvedAll.value = true;
    } catch (error) {
      console.error(error);
    } finally {
      approving.value = false;
    }
  }

  return { requiredAllowances, approveAllowances, approving, approvedAll };
}
