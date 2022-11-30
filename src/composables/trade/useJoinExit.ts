import {
  buildRelayerCalls,
  SubgraphPoolBase,
  SwapInfo,
  SwapTypes,
} from '@balancer-labs/sdk';
import { Pool } from '@balancer-labs/sor/dist/types';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { WeiPerEther as ONE, Zero } from '@ethersproject/constants';
import {
  computed,
  ComputedRef,
  onMounted,
  reactive,
  Ref,
  ref,
  toRefs,
  watchEffect,
} from 'vue';

import { balancer } from '@/lib/balancer.sdk';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

import useTokens from '../useTokens';
import { TradeQuote } from './types';

type JoinExitState = {
  validationErrors: {
    highPriceImpact: boolean;
  };
  submissionError: string | null;
};

const state = reactive<JoinExitState>({
  validationErrors: {
    highPriceImpact: false,
  },
  submissionError: null,
});

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: Ref<string>;
  tokenInAmountInput: Ref<string>;
  tokenOutAddressInput: Ref<string>;
  tokenOutAmountInput: Ref<string>;
  tokenInAmountScaled: ComputedRef<BigNumber>;
  tokenOutAmountScaled: ComputedRef<BigNumber>;
  tokenIn: ComputedRef<TokenInfo>;
  tokenOut: ComputedRef<TokenInfo>;
  slippageBufferRate: ComputedRef<number>;
  pools: Ref<(Pool | SubgraphPoolBase)[]>;
};

export type useJoinExit = ReturnType<typeof useJoinExit>;

export default function useJoinExit({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  slippageBufferRate,
  pools,
}: Props) {
  const swapInfo = ref<SwapInfo | null>(null);
  const trading = ref(false);
  const confirming = ref(false);
  const priceImpact = ref(0);
  const latestTxHash = ref('');

  // COMPOSABLES
  const { account } = useWeb3();
  const { injectTokens, getToken } = useTokens();

  const hasValidationError = computed(
    () => state.validationErrors.highPriceImpact != null
  );

  function resetState() {
    state.validationErrors.highPriceImpact = false;

    state.submissionError = null;
  }

  function resetInputAmounts(amount: string): void {
    tokenInAmountInput.value = amount;
    tokenOutAmountInput.value = amount;
    priceImpact.value = 0;
  }

  async function handleAmountChange(): Promise<void> {
    const amount = exactIn.value
      ? tokenInAmountInput.value
      : tokenOutAmountInput.value;
    // Avoid using SOR if querying a zero value or (un)wrapping trade
    const zeroValueTrade = amount === '' || amount === '0';
    if (zeroValueTrade) {
      resetInputAmounts(amount);
      return;
    }

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;

    if (!tokenInAddress || !tokenOutAddress) {
      if (exactIn.value) tokenOutAmountInput.value = '';
      else tokenInAmountInput.value = '';
      return;
    }
  }

  async function trade(successCallback?: () => void) {
    try {
      confirming.value = true;
      state.submissionError = null;

      if (!swapInfo.value) {
        return;
      }

      const relayerCallData = buildRelayerCalls(
        swapInfo.value,
        // @ts-ignore-next-line -- Fix types incompatibility error. Related to BigNumber?
        pools.value as SubgraphPoolBase[],
        account.value,
        balancer.contracts.relayerV4?.address ?? '',
        balancer.networkConfig.addresses.tokens.wrappedNativeAsset,
        '50',
        undefined
      );
      console.log(relayerCallData);

      const q = await balancer.contracts.relayerV4
        ?.connect(account.value)
        .callStatic.multicall(relayerCallData.rawCalls);

      console.log(q);
      if (successCallback != null) {
        successCallback();
      }
      confirming.value = false;
    } catch (e) {
      state.submissionError = (e as Error).message;
      confirming.value = false;
    }
  }

  function getMaxIn(amount: BigNumber) {
    return amount
      .mul(parseFixed(String(1 + slippageBufferRate.value), 18))
      .div(ONE);
  }

  function getMinOut(amount: BigNumber) {
    return amount
      .mul(ONE)
      .div(parseFixed(String(1 + slippageBufferRate.value), 18));
  }

  function getQuote(): TradeQuote {
    const maximumInAmount =
      tokenInAmountScaled != null ? getMaxIn(tokenInAmountScaled.value) : Zero;

    const minimumOutAmount =
      tokenOutAmountScaled != null
        ? getMinOut(tokenOutAmountScaled.value)
        : Zero;

    return {
      feeAmountInToken: '0',
      feeAmountOutToken: '0',
      maximumInAmount,
      minimumOutAmount,
    };
  }

  // LIFECYCLE
  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (tokenInAddressInput.value && !getToken(tokenInAddressInput.value)) {
      unknownAssets.push(tokenInAddressInput.value);
    }
    if (tokenOutAddressInput.value && !getToken(tokenOutAddressInput.value)) {
      unknownAssets.push(tokenOutAddressInput.value);
    }
    await injectTokens(unknownAssets);
    await handleAmountChange();
  });

  watchEffect(async () => {
    swapInfo.value = await balancer.sor.getSwaps(
      tokenInAddressInput.value,
      tokenOutAddressInput.value,
      exactIn.value ? SwapTypes.SwapExactIn : SwapTypes.SwapExactOut,
      parseFixed(tokenInAmountInput.value || tokenOutAmountInput.value, 18),
      undefined,
      true
    );
  });

  return {
    ...toRefs(state),
    pools,
    hasValidationError,
    handleAmountChange,
    exactIn,
    trade,
    swapInfo,
    trading,
    priceImpact,
    latestTxHash,
    getQuote,
    resetState,
    confirming,
    resetInputAmounts,
  };
}
