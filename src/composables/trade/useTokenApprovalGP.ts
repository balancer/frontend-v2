import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import useNotify from '@/composables/useNotify';
import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import { ETHER } from '@/constants/tokenlists';
import { parseUnits } from '@ethersproject/units';
import { TokenMap } from '@/types';

export default function useTokenApprovalGP(
  tokenInAddress: Ref<string>,
  amount: Ref<string>,
  tokens: ComputedRef<TokenMap>
) {
  const approving = ref(false);
  const approved = ref(false);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { txListener } = useNotify();

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
      approvalTxListener(tx.hash);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  function approvalTxListener(hash: string) {
    txListener(hash, {
      onTxConfirmed: () => {
        approving.value = false;
        approved.value = true;
      },
      onTxCancel: () => {
        approving.value = false;
      },
      onTxFailed: () => {
        approving.value = false;
      }
    });
  }

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
    allowanceState
  };
}
