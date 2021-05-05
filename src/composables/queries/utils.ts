import {
  PoolActivity,
  PoolActivityType
} from '@/services/balancer/subgraph/types';

export function normalizePoolActivity(
  poolEvent: PoolActivity,
  type: PoolActivityType
) {
  return {
    ...poolEvent,
    timestamp: poolEvent.timestamp * 1000,
    type
  };
}
