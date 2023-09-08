import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { parseEther } from '@ethersproject/units';
import { randomAddress } from '@tests/unit/builders/address';
import { DeepPartial } from '@tests/unit/types';

export function toOnchainVotesNextPeriod(formattedVotes: string): string {
  return parseEther(formattedVotes).toString();
}

export function aVotingPool(...options: DeepPartial<VotingPool>[]): VotingPool {
  const defaultPool: Partial<VotingPool> = {
    id: 'voting pool id',
    votesNextPeriod: '0',
    userVotes: '0',
    gauge: {
      address: randomAddress(),
      isKilled: false,
      relativeWeightCap: '0.1',
    },
  };
  return Object.assign({}, defaultPool, ...options);
}
