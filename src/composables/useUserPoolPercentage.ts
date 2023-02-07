import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { Ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { isVeBalPool } from './usePool';
import { useLock } from './useLock';

export function useUserPoolPercentage(pool: Ref<Pool>) {
  const { balanceFor } = useTokens();
  const { stakedShares } = usePoolStaking();
  // Avoid lock queries when pool is not veBAL:
  const { lock, lockedFiatTotal } = useLock({
    enabled: isVeBalPool(pool.value.id),
  });
  const { fNum2 } = useNumbers();

  const lockedAmount = computed(() => {
    // return lock.value?.lockedAmount || '0';
    return lockedFiatTotal.value || '0';
  });

  const userPoolPercentage = computed(() => {
    const bptBalance = bnum(balanceFor(pool.value.address))
      .plus(stakedShares.value)
      .plus(lockedAmount.value);
    return bptBalance.div(bnum(pool.value.totalLiquidity)).multipliedBy(100);
  });

  const userPoolPercentageLabel = computed(
    () =>
      fNum2(userPoolPercentage.value.toString(), {
        maximumSignificantDigits: 2,
      }) + '%'
  );

  return {
    userPoolPercentage,
    userPoolPercentageLabel,
  };
}
