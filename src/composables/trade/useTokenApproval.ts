import { useStore } from 'vuex';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { ETHER } from '@/constants/tokenlists';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import useAllowances from '../useAllowances';
import { TransactionResponse } from '@ethersproject/providers';
import useEthers from '../useEthers';
import { TokenMap } from '@/types';
import useTransactions from '../useTransactions';

export default function useTokenApproval(
  tokenInAddress: Ref<string>,
  amount: Ref<string>,
  tokens: ComputedRef<TokenMap>
) {
  const approving = ref(false);
  const approved = ref(false);
  const { addTransaction } = useTransactions();

  // COMPOSABLES
  const store = useStore();
  const { getProvider } = useVueWeb3();

  const { txListener } = useEthers();

  const { config } = store.state.web3;
  const dstList = computed(() => [config.addresses.exchangeProxy]);
  const allowanceTokens = computed(() => [tokenInAddress.value]);
  const {
    getRequiredAllowances,
    isLoading: isLoadingAllowances
  } = useAllowances({
    dstList,
    tokens: allowanceTokens
  });

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

    const requiredAllowancesV1 = getRequiredAllowances({
      dst: config.addresses.exchangeProxy,
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    const requiredAllowancesV2 = getRequiredAllowances({
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    return {
      isUnlockedV1: requiredAllowancesV1.length === 0,
      isUnlockedV2: requiredAllowancesV2.length === 0
    };
  });

  async function approveV1(): Promise<void> {
    console.log('[TokenApproval] Unlock V1');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        getProvider(),
        config.addresses.exchangeProxy,
        [tokenInAddress.value]
      );
      txHandler(tx, config.addresses.exchangeProxy);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  async function approveV2(): Promise<void> {
    console.log('[TokenApproval] Unlock V2');
    approving.value = true;
    try {
      const [tx] = await approveTokens(getProvider(), config.addresses.vault, [
        tokenInAddress.value
      ]);
      txHandler(tx, config.addresses.vault);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  function txHandler(tx: TransactionResponse, spender: string): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: tokens.value[tokenInAddress.value].symbol,
      details: {
        tokenAddress: tokenInAddress.value,
        amount: amount.value,
        spender
      }
    });

    txListener(tx, {
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
    }
  });

  return {
    approving,
    approveV1,
    approveV2,
    allowanceState,
    isLoading: isLoadingAllowances
  };
}
