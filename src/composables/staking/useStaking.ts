import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export default function useStaking() {
  // TODO INTEGRATE STAKING CONTRACT
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

  return {
    getStakeState
  };
}
