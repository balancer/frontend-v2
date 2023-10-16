import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { Network } from '@/lib/config/types';
import { parseEther } from '@ethersproject/units';
import { randomAddress } from '@tests/unit/builders/address';
import { DeepPartial } from '@tests/unit/types';

export function toOnchainVotesNextPeriod(formattedVotes: string): string {
  return parseEther(formattedVotes).toString();
}

const defaultPoolTokens = [
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    weight: 'null',
    symbol: 'USDC',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    weight: 'null',
    symbol: 'USDT',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  },
];

export function aVotingPool(...options: DeepPartial<VotingPool>[]): VotingPool {
  const defaultPool: Partial<VotingPool> = {
    id: 'voting pool id',
    votesNextPeriod: '0',
    userVotes: '0',
    lastUserVoteTime: 0,
    gauge: {
      address: randomAddress(),
      isKilled: false,
      relativeWeightCap: '0.1',
    },
    network: Network.MAINNET,
    tokens: defaultPoolTokens,
    votes: '8212341531532800',
  };
  return Object.assign({}, defaultPool, ...options);
}
