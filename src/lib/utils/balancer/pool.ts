import { getAddress } from 'ethers/lib/utils';

export function getPoolAddress(poolId: string) {
  return getAddress(poolId.slice(0, 42));
}
