import { onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';

import { usePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

import usePoolTransfers from './usePoolTransfers';

/**
 * This should only be used once at the highest level of the invest/withdraw flow
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
  const { pool, transfersAllowed } = usePoolTransfers();
  const { noInitLiquidity } = usePool(pool);

  /**
   * METHODS
   */
  function shouldBlockAccess(pool: Pool): boolean {
    if (noInitLiquidity(pool)) return true;
    return false;
  }

  /**
   * WATCHERS
   */
  watch(pool, loadedPool => {
    if (loadedPool && shouldBlockAccess(loadedPool)) {
      transfersAllowed.value = false;
      router.push({ name: 'pool', params: { id: loadedPool.id } });
    }
  });

  /**
   * CALLBACKS
   */
  onBeforeMount(() => {
    transfersAllowed.value = false;
    if (pool.value && shouldBlockAccess(pool.value)) {
      router.push({ name: 'pool', params: { id: pool.value.id } });
    } else {
      transfersAllowed.value = true;
    }
  });
}
