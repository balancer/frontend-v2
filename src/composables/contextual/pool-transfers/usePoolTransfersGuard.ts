import { Pool } from '@/services/pool/types';
import { onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';

import useNetwork from '@/composables/useNetwork';
import usePoolTransfers from './usePoolTransfers';

/**
 * This should only be used once at the highest level of the add-liquidity/withdraw flow
 * which is the PoolTransfersLayout.
 *
 * Before page mount it checks if the pool has been loaded and if so checks if transfers
 * are allowed. If not, redirects back to pool page. It also watches the pool value
 * in the case where the page is accessed before the pool is loaded, e.g. direct access.
 * When the pool has a value, i.e. it's loaded, it then checks if transfers are allowed
 * and redirects if not.
 */
export default function usePoolTransfersGuard() {
  /**
   * COMPOSABLES
   */
  const router = useRouter();
  const { pool, joinsDisabled } = usePoolTransfers();
  const { networkSlug } = useNetwork();

  /**
   * WATCHERS
   */
  watch(pool, loadedPool => {
    redirectIfNeeded(loadedPool);
  });

  /**
   * CALLBACKS
   */
  onBeforeMount(() => {
    redirectIfNeeded(pool.value);
  });

  /**
   * HELPERS
   */
  function redirectIfNeeded(pool: Pool | undefined) {
    if (pool && joinsDisabled.value) {
      redirectToPoolDetail(pool.id);
    }
  }

  function redirectToPoolDetail(poolId) {
    router.push({
      name: 'pool',
      params: { id: poolId, networkSlug },
    });
  }
}
