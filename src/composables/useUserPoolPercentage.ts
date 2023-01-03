import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { computed } from 'vue';
import useStaking from './staking/useStaking';
import useTokens from './useTokens';
import useNumbers from '@/composables/useNumbers';

export function useUserPoolPercentage(pool: Pool) {
  const { balanceFor } = useTokens();
  const {
    userData: { stakedSharesForProvidedPool },
  } = useStaking();
  const { fNum2 } = useNumbers();

  const userPoolPercentage = computed(() => {
    const bptBalance = bnum(balanceFor(pool.address)).plus(
      stakedSharesForProvidedPool.value
    );
    return bptBalance.div(bnum(pool.totalLiquidity)).multipliedBy(100);
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
