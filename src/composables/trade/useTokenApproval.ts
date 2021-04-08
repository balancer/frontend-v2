import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import { computed, ref, watch } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { approveTokens } from '@/utils/balancer/tokens';
import useBlocknative from '@/composables/useBlocknative';
import { ETHER } from '@/constants/tokenlists';

export default function useTokenApproval(tokenInAddress, amount, tokens) {
  const approving = ref(false);
  const approved = ref(false);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { notify } = useBlocknative();

  const { config } = store.state.web3;

  const allowanceState = computed(() => {
    if (tokenInAddress.value === ETHER.address) {
      return {
        isUnlockedV1: true,
        isUnlockedV2: true
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlockedV1: true,
        isUnlockedV2: true
      };

    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;
    const tokenInAmountDenorm = parseUnits(amount.value, tokenInDecimals);
    const tokensRequired = {};
    tokensRequired[tokenInAddress.value] = tokenInAmountDenorm;

    const requiredAllowancesV1 = store.getters.getRequiredAllowances({
      dst: config.addresses.exchangeProxy,
      tokens: tokensRequired
    });

    const requiredAllowancesV2 = store.getters.getRequiredAllowances({
      tokens: tokensRequired
    });

    return {
      isUnlockedV1: Object.keys(requiredAllowancesV1).length === 0,
      isUnlockedV2: Object.keys(requiredAllowancesV2).length === 0
    };
  });

  async function checkAllowances(): Promise<void> {
    await Promise.all([
      store.dispatch('getAllowances', {
        tokens: [tokenInAddress.value]
      }),
      store.dispatch('getAllowances', {
        tokens: [tokenInAddress.value],
        dst: config.addresses.exchangeProxy
      })
    ]);
  }

  async function approveV1(): Promise<void> {
    console.log('[TokenApproval] Unlock V1');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        auth.web3,
        config.addresses.exchangeProxy,
        [tokenInAddress.value]
      );
      txListener(tx.hash);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  async function approveV2(): Promise<void> {
    console.log('[TokenApproval] Unlock V2');
    approving.value = true;
    try {
      const [tx] = await approveTokens(auth.web3, config.addresses.vault, [
        tokenInAddress.value
      ]);
      txListener(tx.hash);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  function txListener(hash) {
    const { emitter } = notify.hash(hash);

    emitter.on('txConfirmed', () => {
      approving.value = false;
      approved.value = true;
      return undefined;
    });

    emitter.on('txCancel', () => {
      // A new transaction has been submitted with the same nonce, a higher gas price, a value of zero and sent to an external address (not a contract)
      approving.value = false;
      return undefined;
    });

    emitter.on('txFailed', () => {
      // An error has occurred initiating the transaction
      approving.value = false;
      return undefined;
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
    approveV1,
    approveV2,
    allowanceState
  };
}
