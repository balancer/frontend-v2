import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { computed, Ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

export function useUserPoolPercentage(pool: Ref<Pool>) {
  const { balanceFor } = useTokens();
  const { stakedShares } = usePoolStaking();
  const { fNum2 } = useNumbers();

  const userPoolPercentage = computed(() => {
    const bptBalance = bnum(balanceFor(pool.value.address)).plus(
      stakedShares.value
    );
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
