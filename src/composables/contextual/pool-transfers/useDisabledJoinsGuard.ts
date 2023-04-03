import { Pool } from '@/services/pool/types';
import { useRouter } from 'vue-router';

import { useDisabledJoinPool } from '@/composables/useDisabledJoinPool';
import useNetwork from '@/composables/useNetwork';

export default function useDisabledJoinsGuard(pool: Pool) {
  const router = useRouter();
  const { networkSlug } = useNetwork();
  const { shouldDisableJoins } = useDisabledJoinPool(pool);
  if (shouldDisableJoins.value) redirectToPoolDetail(pool.id);

  function redirectToPoolDetail(poolId) {
    router.push({
      name: 'pool',
      params: { id: poolId, networkSlug },
    });
  }
}
