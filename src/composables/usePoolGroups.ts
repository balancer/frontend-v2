import lrtPoolGroups from '@/assets/data/pools/groups/LRT.json';

export function usePoolGroups(chainId: string | number) {
  const lrtPools: string[] = lrtPoolGroups[chainId.toString()]?.map(
    pool => pool.poolId
  ) || ['0x'];

  return { lrtPools };
}
