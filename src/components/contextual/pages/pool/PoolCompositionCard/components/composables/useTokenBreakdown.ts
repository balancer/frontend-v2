import { computed, Ref } from 'vue';
import { bnum } from '@/lib/utils';
import { PoolToken } from '@/services/pool/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isNumber } from '@/lib/utils/numbers';

export function useTokenBreakdown(
  token: Ref<PoolToken>,
  shareOfParentInPool: Ref<number>,
  isDeepPool: Ref<boolean>,
  myPoolPercentage: Ref<number>
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

  const applyMyPoolPercentageTo = (value: string): number =>
    (Number(value) * Number(myPoolPercentage.value)) / 100;

  const balanceValue = computed(() => {
    if (isParentTokenInDeepPool.value) return '';

    if (token.value.priceRate && isDeepPool.value) {
      const equivMainTokenBalance = bnum(balance.value)
        .times(token.value.priceRate)
        .toString();

      return equivMainTokenBalance;
    }

    return token.value.balance;
  });

  const balanceLabel = computed(() => formatBalanceValue(balanceValue.value));
  const myBalanceLabel = computed(() =>
    formatBalanceValue(applyMyPoolPercentageTo(balanceValue.value))
  );

  function formatBalanceValue(value: string | number) {
    if (!isNumber(value)) return value;
    return fNum2(value, FNumFormats.token);
  }

  const fiatValue = computed(() => {
    if (isParentTokenInDeepPool.value) return '';

    let value = toFiat(balance.value, token.value.address);

    if (value === '0' && token.value.token?.latestUSDPrice) {
      // Attempt to use latest USD price from subgraph.
      value = bnum(balance.value)
        .times(token.value.token.latestUSDPrice)
        .toString();
    }
    if (fiatValue.value === '0') return '-';
    return value;
  });

  function formatFiatValue(value: string | number): string {
    value = value.toString();
    if (!isNumber(value)) return value;

    return fNum2(value, FNumFormats.fiat);
  }

  const fiatLabel = computed(() => formatFiatValue(fiatValue.value));

  const myFiatLabel = computed(() =>
    formatFiatValue(applyMyPoolPercentageTo(fiatValue.value))
  );

  const tokenWeightLabel = computed(() => {
    if (!token.value || !token.value.weight) return '';
    return fNum2(token.value.weight, FNumFormats.percent);
  });

  return {
    balanceLabel,
    myBalanceLabel,
    fiatLabel,
    myFiatLabel,
    tokenWeightLabel,
  };
}
