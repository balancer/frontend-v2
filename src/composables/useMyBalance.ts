import { computed } from 'vue';
import useTokens from './useTokens';
import { bnum } from '@/lib/utils';
import useStaking from './staking/useStaking';
import { Pool } from '@/services/pool/types';
import useNumbers, { FNumFormats } from './useNumbers';
import { fiatValueOf } from './usePool';
import useWeb3 from '@/services/web3/useWeb3';

export function useMyBalance(pool: Pool) {
  const { isWalletReady } = useWeb3();
  const { fNum2 } = useNumbers();
  const { balanceFor } = useTokens();
  const {
    userData: { stakedSharesForProvidedPool },
  } = useStaking();

  const bptBalance = computed(() =>
    bnum(balanceFor(pool.address)).plus(stakedSharesForProvidedPool.value)
  );

  const myPoolPercentage = computed(() =>
    bptBalance.value.div(bnum(pool.totalLiquidity)).multipliedBy(100)
  );

  const bptBalanceWithoutStaked = computed((): string =>
    bnum(balanceFor(pool.address)).toString()
  );

  const fiatValue = computed(() =>
    fiatValueOf(pool, bptBalance.value.toString())
  );

  const formattedFiatValue = computed(() =>
    isWalletReady ? fNum2(fiatValue.value, FNumFormats.fiat) : '-'
  );

  const formattedTotalLiquidityFiatValue = computed(() =>
    isWalletReady ? fNum2(pool.totalLiquidity, FNumFormats.fiat) : '-'
  );

  const poolLiquidity = computed(() => pool.totalLiquidity || 0);

  return {
    bptBalance,
    bptBalanceWithoutStaked,
    formattedFiatValue,
    fiatValue,
    poolLiquidity,
    formattedTotalLiquidityFiatValue,
    myPoolPercentage,
  };
}
