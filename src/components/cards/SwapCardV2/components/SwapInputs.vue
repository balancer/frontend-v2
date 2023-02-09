<script lang="ts" setup>
import useConfig from '@/composables/useConfig';
import { useSwaps } from '@/providers/local/swaps.provider';
import { SwapType } from '@balancer-labs/sdk';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { networkId } from '@/composables/useNetwork';
import initialTokens from '@/constants/initialTokens.json';
import { lsGet } from '@/lib/utils';
import { getAddress, isAddress } from '@ethersproject/address';
import { useTokens } from '@/providers/tokens.provider';

/**
 * STATE
 */
const tokenOutInput = ref<HTMLInputElement>();

/**
 * COMPOSABLES
 */
const { setSwapType, priceImpact, isLoading, tokenIn, tokenOut } = useSwaps();
const { networkConfig } = useConfig();
const router = useRouter();
const { injectTokens } = useTokens();

/**
 * COMPUTED
 */
// Array of tokens that should be excluded from swapping, e.g. veBAL.
const excludedTokens = computed<string[]>(() => {
  return [networkConfig.addresses.veBAL];
});

/**
 * METHODS
 */

/**
 * For tokenIn and tokenOut;
 * 1. Check if route contains a token address param, if so use it,
 * 2. Else check if local storage has a state, if so use it,
 * 3. Else default to native asset for tokenIn and empty string for tokenOut
 */
async function initTokens() {
  let initTokenIn, initTokenOut;

  // Set tokenIn
  const routeTokenIn = router.currentRoute.value.params.assetIn as string;
  if (routeTokenIn === networkConfig.nativeAsset.deeplinkId) {
    initTokenIn = networkConfig.nativeAsset.address;
  } else if (isAddress(routeTokenIn)) {
    initTokenIn = getAddress(routeTokenIn);
  } else {
    initTokenIn = lsGet(
      `swap.inputAsset.${networkId.value}`,
      initialTokens[networkId.value].input
    );
  }

  // Set tokenOut
  const routeTokenOut = router.currentRoute.value.params.assetOut as string;
  if (routeTokenOut === networkConfig.nativeAsset.deeplinkId) {
    initTokenOut = networkConfig.nativeAsset.address;
  } else if (isAddress(routeTokenOut)) {
    initTokenOut = getAddress(routeTokenOut);
  } else {
    initTokenOut = lsGet(`swap.outputAsset.${networkId.value}`, '');
  }

  await injectTokens([initTokenIn, initTokenOut]);
  tokenIn.address = initTokenIn;
  tokenOut.address = initTokenOut;
}

/**
 * Check if route contains amount params. If inAmount is set use it, else if
 * outAmount is set use that, but you can't set both.
 */
async function initAmounts() {
  await nextTick();
  const routeInAmount = router.currentRoute.value.query?.inAmount as string;
  const routeOutAmount = router.currentRoute.value.query?.outAmount as string;

  if (routeInAmount) {
    tokenIn.amount = routeInAmount;
    setSwapType(SwapType.SwapExactIn);
  } else if (routeOutAmount) {
    console.log('routeOutAmount', routeOutAmount);
    tokenOut.amount = routeOutAmount;
    setSwapType(SwapType.SwapExactOut);
  }
}

onBeforeMount(async () => {
  await initTokens();
  await initAmounts();
});
</script>

<template>
  <div>
    <TokenInput
      ref="tokenInInput"
      v-model:amount="tokenIn.amount"
      v-model:address="tokenIn.address"
      v-model:isValid="tokenIn.valid"
      name="tokenIn"
      :excludedTokens="excludedTokens"
      :ignoreWalletBalance="isLoading"
      autoFocus
      @input="setSwapType(SwapType.SwapExactIn)"
      @set-max="setSwapType(SwapType.SwapExactIn)"
    />

    <!-- <div class="flex items-center my-2">
      <SwapPairToggle @toggle="handleTokenSwitch" />
      <div class="mx-2 h-px bg-gray-100 dark:bg-gray-700 grow" />
      <div
        v-if="rateLabel"
        class="flex items-center text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
        @click="isInRate = !isInRate"
        v-html="rateLabel"
      />
    </div> -->

    <TokenInput
      ref="tokenOutInput"
      v-model:amount="tokenOut.amount"
      v-model:address="tokenOut.address"
      v-model:isValid="tokenOut.valid"
      name="tokenOut"
      :priceImpact="priceImpact"
      :excludedTokens="excludedTokens"
      noRules
      noMax
      disableNativeAssetBuffer
      @input="setSwapType(SwapType.SwapExactOut)"
    />
  </div>
</template>
