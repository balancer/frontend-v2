import { computed, Ref, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { parseUnits } from '@ethersproject/units';

import { ETHER } from '@/constants/tokenlists';

import useAuth from '@/composables/useAuth';

import { approveTokens } from '@/lib/utils/balancer/tokens';

import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';

import useTokens from '../useTokens';

export default function useTokenApprovalGP(
  tokenInAddress: Ref<string>,
  amount: Ref<string>
) {
  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { allTokensIncludeEth: tokens } = useTokens();

  // DATA
  const approving = ref(false);
  const approved = ref(false);

  // COMPUTED
  const allowanceState = computed(() => {
    if (tokenInAddress.value === ETHER.address) {
      return {
        isUnlocked: true
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlocked: true
      };

    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;
    const tokenInAmountDenorm = parseUnits(amount.value, tokenInDecimals);

    const requiredAllowances = store.getters['account/getRequiredAllowances']({
      dst: GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS,
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    return {
      isUnlocked: requiredAllowances.length === 0
    };
  });

  async function checkAllowances(): Promise<void> {
    await Promise.all([
      store.dispatch('account/getAllowances', {
        tokens: [tokenInAddress.value],
        dst: GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS
      })
    ]);
  }

  async function approve(): Promise<void> {
    console.log('[TokenApproval] Unlock token for trading on Gnosis Protocol');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        auth.web3,
        GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS,
        [tokenInAddress.value]
      );

      const txRecipient = await tx.wait();
      console.log(txRecipient);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  const isApproved = computed(() => {
    return allowanceState.value.isUnlocked;
  });

  watch(tokenInAddress, async () => {
    if (tokenInAddress.value === ETHER.address) {
      approved.value = true;
    } else {
      approved.value = false;
      await checkAllowances();
    }
  });

  return {
    approving,
    approve,
    allowanceState,
    isApproved
  };
}
