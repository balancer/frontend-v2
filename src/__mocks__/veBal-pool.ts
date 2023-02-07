import { aWeightedPool } from './weighted-pool';
import { POOLS } from '@/constants/pools';

const veBalPoolId = POOLS.IdsMap.veBAL as string;
const veBalPool = aWeightedPool();
veBalPool.id = veBalPoolId;

export { veBalPool };
