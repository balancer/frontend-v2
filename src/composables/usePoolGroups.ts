import { ref, onBeforeMount } from 'vue';

const lrtPools = ref<string[]>([]);
const pointPools = ref<string[]>([]);

const chainIdToNetworkFileMap = {
  1: 'mainnet',
  42161: 'arbitrum',
  1101: 'zkevm',
};

export function usePoolGroups(chainId: string | number) {
  const fileName = chainIdToNetworkFileMap[chainId] || 'mainnet';

  onBeforeMount(async () => {
    const module = await import(`@/assets/data/pools/${fileName}.json`);
    const pools = module.default;

    lrtPools.value = pools
      .filter(pool => pool.categories.includes('lrt'))
      .map(pool => pool.id);

    pointPools.value = pools
      .filter(pool => pool.categories.includes('points'))
      .map(pool => pool.id);
  });

  return { lrtPools, pointPools };
}
