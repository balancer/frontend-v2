import { computed, Ref } from 'vue';
import { bnum } from '@/lib/utils';
import { PoolToken } from '@/services/pool/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

export function useTokenBreakdown(
  token: Ref<PoolToken>,
  shareOfParentInPool: Ref<number>,
  isDeepPool: Ref<boolean>
) {
  const { fNum2, toFiat } = useNumbers();

  // To get the balance of this token in the current pool we need to know the
  // share of it's parent in this pool. e.g. If the token is DAI which is nested
  // in bb-a-DAI, we need to know what share of bb-a-DAI is contained in the
  // current pool. Then we can use this share and multiply it by the total
  // balance of this token.
  const balance = computed(() => {
    return bnum(token.value.balance)
      .times(shareOfParentInPool.value)
      .toString();
  });

  const isParentTokenInDeepPool = computed(() => {
    const hasNestedTokens = token.value?.token?.pool?.tokens;
    return hasNestedTokens && isDeepPool.value;
  });

  const balanceLabel = computed(() => {
    if (isParentTokenInDeepPool.value) return '';

    if (token.value.priceRate && isDeepPool.value) {
      const equivMainTokenBalance = bnum(balance.value)
        .times(token.value.priceRate)
        .toString();

      return fNum2(equivMainTokenBalance, FNumFormats.token);
    }

    return fNum2(token.value.balance, FNumFormats.token);
  });

  const fiatLabel = computed(() => {
    if (isParentTokenInDeepPool.value) return '';

    let fiatValue = toFiat(balance.value, token.value.address);

    if (fiatValue === '0' && token.value.token?.latestUSDPrice) {
      // Attempt to use latest USD price from subgraph.
      fiatValue = bnum(balance.value)
        .times(token.value.token.latestUSDPrice)
        .toString();
    }

    if (fiatValue === '0') return '-';

    return fNum2(fiatValue, FNumFormats.fiat);
  });

  const tokenWeightLabel = computed(() => {
    if (!token.value || !token.value.weight) return '';
    return fNum2(token.value.weight, FNumFormats.percent);
  });

  return { balanceLabel, fiatLabel, tokenWeightLabel };
}
