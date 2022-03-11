import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';

export enum StakeState {
  CanStake = 'CanStake',
  MaxStaked = 'MaxStaked',
  NoGuage = 'NoGauge'
}

function getStakeState(pool: DecoratedPoolWithShares) {
  // just random logic for differentiating between stake states // TODO REPLACE
  if (Number(pool.shares) >= 20000) {
    return StakeState.MaxStaked;
  } else if (Number(pool.shares) < 20000 && Number(pool.shares) >= 5000) {
    return StakeState.CanStake;
  } else {
    return StakeState.NoGuage;
  }
}

export default function useStaking() {
  return {
    getStakeState
  };
}
