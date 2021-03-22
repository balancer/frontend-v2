import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import { computed, ref, watch } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { approveTokens } from '@/utils/balancer/tokens';

export default function useTokenApproval(tokenInAddress, amount, tokens) {
  const store = useStore();
  const auth = useAuth();
  const approving = ref(false);
  const approved = ref(false);

  const { config } = store.state.web3;

  const requireAllowance = computed(() => {
    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return false;
    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;
    const tokenInAmountDenorm = parseUnits(amount.value, tokenInDecimals);
    const tokensRequired = {};
    tokensRequired[tokenInAddress.value] = tokenInAmountDenorm;
    const requiredAllowances = store.getters.getRequiredAllowances({
      dst: config.addresses.exchangeProxy,
      tokens: tokensRequired
    });
    return Object.keys(requiredAllowances).length > 0;
  });

  async function checkApproval(): Promise<void> {
    await store.dispatch('getAllowances', {
      tokens: [tokenInAddress.value],
      dst: config.addresses.exchangeProxy
    });
  }

  async function approve(): Promise<void> {
    approving.value = true;
    try {
      const txs = await approveTokens(
        auth.web3,
        config.addresses.exchangeProxy,
        [tokenInAddress.value]
      );
      await txs[0].wait();
      await checkApproval();
      approved.value = true;
    } catch (e) {
      console.log(e);
    } finally {
      approving.value = false;
    }
  }

  watch(tokenInAddress, async () => {
    approved.value = false;
    await checkApproval();
  });

  return {
    approving,
    approve,
    requireAllowance
  };
}
