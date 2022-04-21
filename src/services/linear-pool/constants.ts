import { AaveLinearPool } from './variants/aave-linear-pool';
import { UsdPlusLinearPool } from './variants/usd-plus-linear-pool';

type LinearPoolClass = typeof UsdPlusLinearPool | typeof AaveLinearPool;

export const linearPoolClassMap: Record<string, LinearPoolClass> = {
  '0x123': UsdPlusLinearPool,
  '0xabc': AaveLinearPool
};
