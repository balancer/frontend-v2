import { BatchSwap, SwapInfo, SwapType } from '@balancer-labs/sdk';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { computed, onMounted, Ref, ref, watch } from 'vue';

import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';
import { balancer } from '@/lib/balancer.sdk';
import { vaultService } from '@/services/contracts/vault.service';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
export type WithdrawMathResponse = ReturnType<typeof useWithdrawMath>;

export default function useWithdrawMath(
  pool: Ref<Pool>,
  tokenOutAddress: Ref<string> = ref(''),
  amountOut: Ref<string> = ref('')
) {
  onMounted(() => {
    fetchPools();
  });

  const swapRoute = ref<SwapInfo | null>(null);
  const swapRouteLoading = ref(false);
  const hasFetchedPools = ref(false);
  // This array can be set by either a regular batch swap result
  // or a batch relayer result, if the batch swap returns 0.
  const singleAssetMax = ref<string>('0');

  const { getToken, balanceFor } = useTokens();
  const { getProvider, account } = useWeb3();
  const { slippage } = useUserSettings();

  const tokenOut = computed(() => getToken(tokenOutAddress.value));

  async function fetchPools() {
    hasFetchedPools.value = await balancer.swaps.fetchPools();
  }

  async function getGasPrice(): Promise<BigNumber> {
    const gasPriceParams = await gasPriceService.getLatest();
    if (gasPriceParams) return BigNumber.from(gasPriceParams.price);
    return getProvider().getGasPrice();
  }

  async function getSwapRoute({
    tokenInAddress,
    tokenOut,
    amountOut,
    swapType
  }: {
    tokenInAddress: string;
    tokenOut: TokenInfo;
    amountOut: string;
    swapType: SwapType;
  }): Promise<SwapInfo | null> {
    if (!amountOut || !tokenOut) return null;
    swapRouteLoading.value = true;
    if (!hasFetchedPools.value) {
      await fetchPools();
    }

    const amount = amountOut;
    const decimals = tokenOut.decimals;
    const safeAmount = overflowProtected(amount, decimals);
    const bnumAmount = parseFixed(safeAmount, decimals);

    const gasPrice = await getGasPrice();
    const findRouteParams = {
      tokenIn: tokenInAddress,
      tokenOut: tokenOut.address,
      amount: bnumAmount,
      gasPrice,
      maxPools: 4
    };
    const findRouteFunc =
      swapType === SwapType.SwapExactIn
        ? balancer.swaps.findRouteGivenIn.bind(balancer.swaps)
        : balancer.swaps.findRouteGivenOut.bind(balancer.swaps);
    console.log({
      swapType,
      amount,
      tokenOut,
      decimals,
      safeAmount,
      bnumAmount,
      findRouteParams
    });

    const route = await findRouteFunc(findRouteParams);

    return route;
  }

  async function getSingleAssetMaxOut() {
    const res = await getSwapRoute({
      tokenInAddress: pool.value.address,
      tokenOut: tokenOut.value,
      amountOut: balanceFor(pool.value.address),
      swapType: SwapType.SwapExactIn
    });
    if (res) {
      console.log({
        res,
        returnAmount: formatUnits(res.returnAmount),
        returnAmountConsideringFees: formatUnits(
          res.returnAmountConsideringFees
        ),
        returnAmountFromSwaps: formatUnits(res.returnAmountFromSwaps),
        swapAmount: formatUnits(res.swapAmount),
        swapAmountForSwaps: formatUnits(res.swapAmountForSwaps)
      });
      const { returnAmount } = res;
      singleAssetMax.value = formatUnits(returnAmount);
    }
  }

  async function updateSwapRoute(): Promise<void> {
    const swapType = SwapType.SwapExactOut;
    const route = await getSwapRoute({
      tokenInAddress: pool.value.address,
      tokenOut: tokenOut.value,
      amountOut: amountOut.value,
      swapType
    });
    if (route) {
      console.log({
        route,
        returnAmount: formatUnits(route.returnAmount),
        returnAmountConsideringFees: formatUnits(
          route.returnAmountConsideringFees
        ),
        returnAmountFromSwaps: formatUnits(route.returnAmountFromSwaps),
        swapAmount: formatUnits(route.swapAmount),
        swapAmountForSwaps: formatUnits(route.swapAmountForSwaps)
      });
    }
    swapRoute.value = route;
    swapRouteLoading.value = false;

    if (swapRoute.value) {
      const deadline = BigNumber.from(`${Math.ceil(Date.now() / 1000) + 60}`); // 60 seconds from now

      // TODO: Get slippage from user settings
      const maxSlippage = parseFloat(slippage.value) * 10000;

      const buildSwapResult = balancer.swaps.buildSwap({
        userAddress: account.value,
        swapInfo: swapRoute.value,
        kind: swapType,
        deadline,
        maxSlippage
      });
      const attributes: BatchSwap = buildSwapResult.attributes as BatchSwap;

      console.log({ buildSwapResult });
      const tx = await vaultService.batchSwap(
        attributes.kind,
        attributes.swaps,
        attributes.assets,
        attributes.funds,
        // TODO: Fix type
        attributes.limits as string[]
      );
    }
  }
  // WATCHERS
  watch(
    [tokenOutAddress, amountOut],
    ([newAddress, newAmount], [oldAddress, oldAmount]) => {
      console.log('something changed', {
        newAddress,
        newAmount,
        oldAddress,
        oldAmount
      });
      if (newAddress !== oldAddress) {
        updateSwapRoute();

        getSingleAssetMaxOut();
      } else if (newAmount !== oldAmount) {
        updateSwapRoute();
      }
    }
  );

  return {
    swapRoute,
    swapRouteLoading,
    singleAssetMax
  };
}
