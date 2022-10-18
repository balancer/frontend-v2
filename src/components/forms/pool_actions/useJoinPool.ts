import usePoolQuery from '@/composables/queries/usePoolQuery';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { SwapAttributes, SwapInfo } from '@balancer-labs/sdk';
import { formatFixed } from '@ethersproject/bignumber';
import { debounce } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';
import JoinPool from './JoinPool';
import { bnum } from '@/lib/utils';
import useUserSettings from '@/composables/useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';

export default function useJoinPool(
  poolId: string,
  poolAddress: string,
  bptDecimals: number | undefined,
  tokensIn: Ref<string[]>,
  amountsIn: Ref<string[]>
) {
  console.log({
    poolId,
    poolAddress,
    bptDecimals,
    tokensIn,
    amountsIn,
  });
  const { getToken } = useTokens();
  const { slippageBsp } = useUserSettings();
  const joinPool = new JoinPool(poolId, poolAddress);

  const swapRoute = ref<SwapInfo | null>(null);
  const bptOut = ref<string>('');
  const fiatValueIn = ref<string>('');
  const fiatValueOut = ref<string>('');
  const priceImpact = ref<number>(0);
  const swapAttributes = ref<SwapAttributes | null>(null);

  const loadingData = ref(false);
  const debouncedFindSwapRoute = ref(debounce(findSwapRoute, 1000));

  const { toFiat } = useNumbers();
  const poolQuery = usePoolQuery(poolId);
  const { account } = useWeb3();

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);

  const tokenCount = computed<number>(() => tokensIn.value.length);

  const highPriceImpact = computed<boolean>(() => {
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  });

  const rektPriceImpact = computed<boolean>(() => {
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT);
  });

  // Input amounts can be null so fullAmounts returns amounts for all tokens
  // and zero if null.
  const fullAmounts = computed((): string[] =>
    new Array(tokenCount.value)
      .fill('0')
      .map((_, i) => amountsIn.value[i] || '0')
  );

  async function findSwapRoute() {
    if (!amountsIn.value[0]) return;
    loadingData.value = true;
    const token = getToken(tokensIn.value[0]);

    const _fiatValueIn = toFiat(amountsIn.value[0], tokensIn.value[0]);

    const _swapRoute = await joinPool
      .findRouteGivenIn(
        tokensIn.value[0],
        amountsIn.value[0],
        token?.decimals || 18
      )
      .finally(() => (loadingData.value = false));

    const { totalLiquidity = '', totalShares = '' } = pool.value || {};
    const _bptOut = formatFixed(
      _swapRoute.returnAmountFromSwaps,
      bptDecimals || 18
    );

    const _fiatValueOut = bnum(totalLiquidity)
      .div(bnum(totalShares))
      .times(bnum(_bptOut))
      .toString();

    const _priceImpact = joinPool.getPriceImpact(_fiatValueIn, _fiatValueOut);

    // Update state variables
    // fiatValueOut.value = toFiat(bpt, poolAddress);
    fiatValueOut.value = _fiatValueOut;
    bptOut.value = _bptOut;
    fiatValueIn.value = _fiatValueIn;
    swapRoute.value = _swapRoute;
    priceImpact.value = _priceImpact;

    if (account.value) {
      swapAttributes.value = joinPool.getSwapAttributes(
        _swapRoute,
        slippageBsp.value,
        account.value
      );
    }

    console.log({
      _swapRoute,
      bptOut,
      fiatValueIn,
      fiatValueOut,
      priceImpact,
      swapAttributes,
      priceImpactPct: priceImpact.value * 100,
      returnAmount: _swapRoute.returnAmount.toString(),
      returnAmountConsideringFees:
        _swapRoute.returnAmountConsideringFees.toString(),
      returnAmountFromSwaps: _swapRoute.returnAmountFromSwaps.toString(),
      swapAmount: _swapRoute.swapAmount.toString(),
      swapAmountForSwaps: _swapRoute.swapAmountForSwaps.toString(),
    });
  }

  // WATCHERS
  watch(
    tokensIn,
    () => {
      debouncedFindSwapRoute.value();
    },
    { deep: true }
  );

  watch(fullAmounts, async (newAmounts, oldAmounts) => {
    const changedIndex = newAmounts.findIndex(
      (amount, i) => oldAmounts[i] !== amount
    );

    if (changedIndex >= 0) {
      debouncedFindSwapRoute.value();
    }
  });

  return {
    findSwapRoute,
    highPriceImpact,
    rektPriceImpact,
    swapRoute,
    bptOut,
    fiatValueIn,
    fiatValueOut,
    priceImpact,
    loadingData,
  };
}
