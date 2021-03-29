import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { approveTokens } from '@/utils/balancer/tokens';
import { parseUnits } from '@ethersproject/units';
import useAuth from '@/composables/useAuth';

export default function useTokenApprovals(approvalTokens, amounts) {
  const auth = useAuth();
  const store = useStore();
  const approving = ref(false);
  const approvedAll = ref(false);

  const allTokens = computed(() => store.getters.getTokens());

  const tokens = computed(() => {
    return Object.fromEntries(
      approvalTokens.map((token, i) => {
        const amount = amounts[i] || '1';
        const tokenDecimals = allTokens.value[token].decimals;
        return [token, parseUnits(amount, tokenDecimals).toString()];
      })
    );
  });

  const requiredAllowances = computed(() => {
    return store.getters.getRequiredAllowances({ tokens: tokens.value });
  });

  async function approveAllowances(): Promise<void> {
    try {
      approving.value = true;
      const txs = await approveTokens(
        auth.web3,
        store.state.web3.config.addresses.vault,
        Object.keys(requiredAllowances.value)
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
