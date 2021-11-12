import { computed, Ref } from 'vue';
import { bnum } from '@/lib/utils';
import useNumbers, { fNum } from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';

export type InvestMathResponse = {
  fullAmounts: Ref<string[]>;
  fiatTotal: Ref<string>;
  fiatTotalLabel: Ref<string>;
};

export default function useTokenFiatMath(
  tokenAddresses: string[],
  amounts: string[]
): InvestMathResponse {
  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { currency } = useUserSettings();

  /**
   * COMPUTED
   */
  const tokenCount = computed(() => tokenAddresses.length);

  // Input amounts can be null so fullAmounts returns amounts for all tokens
  // and zero if null.
  const fullAmounts = computed((): string[] =>
    new Array(tokenCount.value).fill('0').map((_, i) => amounts[i] || '0')
  );

  const fiatAmounts = computed((): string[] =>
    fullAmounts.value.map((_, i) => fiatAmount(i))
  );

  const fiatTotal = computed((): string =>
    fiatAmounts.value.reduce(
      (total, amount) =>
        bnum(total)
          .plus(amount)
          .toString(),
      '0'
    )
  );

  const fiatTotalLabel = computed((): string =>
    fNum(fiatTotal.value, currency.value)
  );

  /**
   * METHODS
   */
  function tokenAmount(index: number): string {
    return fullAmounts.value[index] || '0';
  }

  function fiatAmount(index: number): string {
    return toFiat(tokenAmount(index), tokenAddresses[index]);
  }

  return {
    // computed
    fullAmounts,
    fiatTotal,
    fiatTotalLabel
  };
}
