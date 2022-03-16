import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { inject } from 'vue';
import { StakingProviderSymbol } from '@/providers/staking.provider';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export function getStakeState(pool: DecoratedPoolWithStakedShares) {
  // just random logic for differentiating between stake states // TODO REPLACE
  if (pool.stakedPct === '1') {
    return StakeState.MaxStaked;
  } else {
    return StakeState.CanStake;
  }
}

export default function useStaking() {
  const providedData = inject(StakingProviderSymbol);
  if (!providedData) {
    throw new Error(
      `useStaking was called from a component that was not a child of <StakingProvider />`
    );
  }
  return providedData;
}
