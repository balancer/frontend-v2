import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isDeep } from '@/composables/usePool';
import { useUserPoolPercentage } from '@/composables/useUserPoolPercentage';
import { bnum } from '@/lib/utils';
import { isNumber } from '@/lib/utils/numbers';
import { Pool, PoolToken } from '@/services/pool/types';
import { computed, Ref } from 'vue';

export interface TokenData {
  balanceLabel: string | number;
  userBalanceLabel: string | number;
  fiatLabel: string;
  userFiatLabel: string;
  tokenWeightLabel: string;
  getTokenPercentageLabel: () => string;
}

export type TokensData = Record<string, TokenData>;

export function useTokenBreakdown(rootPool: Ref<Pool>) {
  const { fNum2, toFiat } = useNumbers();

  const { userPoolPercentage } = useUserPoolPercentage(rootPool);
  const isDeepPool = computed(() => isDeep(rootPool.value));
  let tokensData: TokensData = {};
  // Sum of every token's fiat value.
  // Used to increase token percentage accuracy as pool.totalLiquidity is not completely in sync with balance * coingecko-price calculations).
  let totalFiat = 0;

  // Recalculates recursive tokensData whenever the pool is re-fetched
  return computed(() => calculateAllTokensData(rootPool));

  function calculateAllTokensData(pool: Ref<Pool>) {
    totalFiat = 0;
    tokensData = {};
    pool.value.tokens.forEach(token => {
      const rootTokenShare = 1;
      calculateTokenData(token, rootTokenShare);
    });
    return tokensData;
  }

  function calculateTokenData(token: PoolToken, shareOfParentInPool: number) {
    // To get the balance of this token in the current pool we need to know the
    // share of it's parent in this pool. e.g. If the token is DAI which is nested
    // in bb-a-DAI, we need to know what share of bb-a-DAI is contained in the
    // current pool. Then we can use this share and multiply it by the total
    // balance of this token.
    const balance = bnum(token.balance).times(shareOfParentInPool).toString();

    const hasNestedTokens = token?.token?.pool?.tokens;
    const isParentTokenInDeepPool = hasNestedTokens && isDeepPool.value;

    const fiatValue = calculateFiatValue();
    if (isNumber(fiatValue)) totalFiat += Number(fiatValue);
    const balanceValue = calculateBalanceValue();

    const userFiat = applyUserPoolPercentageTo(fiatValue);
    const userFiatLabel = fiatValue === '' ? '' : formatFiatValue(userFiat);

    const userBalanceLabel =
      balanceValue === ''
        ? ''
        : formatBalanceValue(applyUserPoolPercentageTo(balanceValue));

    const tokenWeightLabel = !token?.weight
      ? ''
      : fNum2(token.weight, FNumFormats.percent);

    function getTokenPercentageLabel() {
      const tokenPercentage = Number(fiatValue) / Number(totalFiat);
      return tokenPercentage === 0
        ? ''
        : fNum2(tokenPercentage, FNumFormats.percent);
    }

    tokensData[token.address] = {
      balanceLabel: formatBalanceValue(calculateBalanceValue()),
      fiatLabel: formatFiatValue(fiatValue),
      userFiatLabel,
      userBalanceLabel: userBalanceLabel,
      tokenWeightLabel,
      getTokenPercentageLabel,
    };

    const isLeaf = !token.token?.pool;
    if (isLeaf || !isDeepPool.value) return;

    const shareOfTokenInPool = bnum(token?.balance || '0')
      .div(token.token?.pool?.totalShares || 1)
      .times(shareOfParentInPool)
      .toNumber();

    // Recursively calculate data for next token level
    token.token?.pool?.tokens?.forEach(token =>
      calculateTokenData(token, shareOfTokenInPool)
    );

    function calculateBalanceValue() {
      if (isParentTokenInDeepPool) return '';
      if (token.priceRate && isDeepPool) {
        const equivMainTokenBalance = bnum(balance)
          .times(token.priceRate)
          .toString();

        return equivMainTokenBalance;
      }
      return token.balance;
    }

    function formatBalanceValue(value: string | number) {
      if (!isNumber(value)) return value;
      return fNum2(value, FNumFormats.token);
    }

    function calculateFiatValue() {
      if (isParentTokenInDeepPool) return '';

      let value = toFiat(balance, token.address);

      if (value === '0' && token.token?.latestUSDPrice) {
        // Attempt to use latest USD price from subgraph.
        value = bnum(balance).times(token.token.latestUSDPrice).toString();
      }
      return value;
    }

    function formatFiatValue(value: string | number): string {
      value = value.toString();
      if (!isNumber(value)) return value;
      return fNum2(value, FNumFormats.fiat);
    }

    function applyUserPoolPercentageTo(value: string): number {
      return (Number(value) * Number(userPoolPercentage.value)) / 100;
    }
  }
}
