import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export default function useStaking() {
  function getStakeState(pool: DecoratedPoolWithStakedShares) {
    // just random logic for differentiating between stake states // TODO REPLACE
    if (pool.stakedPct === '1') {
      return StakeState.MaxStaked;
    } else {
      return StakeState.CanStake;
    }
  }

  return {
    getStakeState
  };
}
