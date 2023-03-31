import { onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';

import { noInitLiquidity } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

import { useHasBlockedJoins } from '@/composables/useHasBlockedJoins';
import useNetwork from '@/composables/useNetwork';
import usePoolTransfers from './usePoolTransfers';

export function shouldRedirect(pool: Pool): boolean {
  return noInitLiquidity(pool);
}

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
  const { pool, transfersAllowed } = usePoolTransfers();
  const { networkSlug } = useNetwork();

  function shouldBlockAccess(pool: Pool) {
    const { hasBlockedJoins } = useHasBlockedJoins(computed(() => pool));
    return noInitLiquidity(pool) || hasBlockedJoins.value;
  }

  /**
   * WATCHERS
   */
  watch(pool, loadedPool => {
    if (loadedPool && noInitLiquidity(loadedPool)) {
      transfersAllowed.value = false;
      if (shouldRedirect(loadedPool)) {
        // Redirect to pool detail
        router.push({
          name: 'pool',
          params: { id: loadedPool.id, networkSlug },
        });
      }
    }
  });

  /**
   * CALLBACKS
   */
  onBeforeMount(() => {
    transfersAllowed.value = false;
    if (pool.value && shouldBlockAccess(pool.value)) {
      if (shouldRedirect(pool.value)) {
        // Redirect to pool detail
        router.push({
          name: 'pool',
          params: { id: pool.value.id, networkSlug },
        });
      }
    } else {
      transfersAllowed.value = true;
    }
  });

  return { transfersAllowed };
}
