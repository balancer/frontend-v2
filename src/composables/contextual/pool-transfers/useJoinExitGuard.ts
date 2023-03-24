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
import { onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';

/**
 * STATE
 */
const transfersAllowed = ref(true);

export function useJoinExitGuard(pool: Ref<Pool | undefined>) {
  /**
   * COMPOSABLES
   */
  const router = useRouter();
  const { noInitLiquidity } = usePoolHelpers(pool);
  const { networkSlug } = useNetwork();

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
      router.push({ name: 'pool', params: { id: loadedPool.id, networkSlug } });
    }
  });

  /**
   * CALLBACKS
   */
  onBeforeMount(() => {
    transfersAllowed.value = false;
    if (pool.value && shouldBlockAccess(pool.value)) {
      router.push({ name: 'pool', params: { id: pool.value.id, networkSlug } });
    } else {
      transfersAllowed.value = true;
    }
  });

  return { transfersAllowed };
}
