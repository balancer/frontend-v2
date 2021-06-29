import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import { computed, ref, watch } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import useNotify from '@/composables/useNotify';
import { ETHER } from '@/constants/tokenlists';
import { TransactionResponse } from '@ethersproject/providers';
import useEthers from '../useEthers';

export default function useTokenApproval(tokenInAddress, amount, tokens) {
  const approving = ref(false);
  const approved = ref(false);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { txListener, supportsBlocknative } = useNotify();
  const { txListener: ethersTxListener } = useEthers();

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

    const requiredAllowancesV1 = store.getters['account/getRequiredAllowances'](
      {
        dst: config.addresses.exchangeProxy,
        tokens: [tokenInAddress.value],
        amounts: [tokenInAmountDenorm.toString()]
      }
    );

    const requiredAllowancesV2 = store.getters['account/getRequiredAllowances'](
      {
        tokens: [tokenInAddress.value],
        amounts: [tokenInAmountDenorm.toString()]
      }
    );

    return {
      isUnlockedV1: requiredAllowancesV1.length === 0,
      isUnlockedV2: requiredAllowancesV2.length === 0
    };
  });

  async function checkAllowances(): Promise<void> {
    await Promise.all([
      store.dispatch('account/getAllowances', {
        tokens: [tokenInAddress.value]
      }),
      store.dispatch('account/getAllowances', {
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
      txHandler(tx);
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
      txHandler(tx);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  function txHandler(tx: TransactionResponse): void {
    if (supportsBlocknative.value) {
      blocknativeTxHandler(tx);
    } else {
      ethersTxHandler(tx);
    }
  }

  function blocknativeTxHandler(tx: TransactionResponse): void {
    txListener(tx.hash, {
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

  function ethersTxHandler(tx: TransactionResponse): void {
    ethersTxListener(tx, {
      onTxConfirmed: () => {
        approving.value = false;
        approved.value = true;
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
    approveV1,
    approveV2,
    allowanceState
  };
}
