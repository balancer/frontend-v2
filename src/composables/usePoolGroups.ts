import { ref, onBeforeMount } from 'vue';

const lrtPools = ref<string[]>([]);

const chainIdToNetworkFileMap = {
  1: 'mainnet',
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
  });

  return { lrtPools };
}
