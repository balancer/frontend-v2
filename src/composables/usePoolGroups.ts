import { ref, onBeforeMount } from 'vue';

const lrtPools = ref<string[]>([]);

const lrtPoolsPromise = import('@/assets/data/pools/groups/LRT.json');

export function usePoolGroups(chainId: string | number) {
  onBeforeMount(async () => {
    const module = await lrtPoolsPromise;

    lrtPools.value = module.default[chainId.toString()]?.map(
      pool => pool.poolId
    ) || ['0x'];
  });

  return { lrtPools };
}
