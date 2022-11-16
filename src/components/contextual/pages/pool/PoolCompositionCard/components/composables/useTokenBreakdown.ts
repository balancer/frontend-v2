import { computed, Ref } from 'vue';
import { bnum } from '@/lib/utils';
import { PoolToken } from '@/services/pool/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

export function useTokenBreakdown(
  token: Ref<PoolToken>,
  parentTotalShare: Ref<string>,
  mainTokenAddress: Ref<string>,
  isDeepPool: Ref<boolean>
) {
  const { fNum2, toFiat } = useNumbers();

  const tokenBPTShare = computed(() => {
    return bnum(token.value?.balance || '0')
      .div(parentTotalShare.value || 1)
      .toString();
  });

  const balance = computed(() => {
    return tokenBPTShare.value != null
      ? bnum(token.value.balance).times(tokenBPTShare.value).toString()
      : token.value.balance;
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

    if (token.value.priceRate && isDeepPool.value) {
      const equivMainTokenBalance = bnum(balance.value)
        .times(token.value.priceRate)
        .toString();

      const fiatValue = toFiat(equivMainTokenBalance, mainTokenAddress.value);
      return fNum2(fiatValue, FNumFormats.fiat);
    }

    const fiatValue = toFiat(token.value.balance, token.value.address);
    return fNum2(fiatValue, FNumFormats.fiat);
  });

  const tokenWeightLabel = computed(() => {
    if (!token.value || !token.value.weight) return '';
    return fNum2(token.value.weight, FNumFormats.percent);
  });

  return { balanceLabel, fiatLabel, tokenWeightLabel, tokenBPTShare };
}
