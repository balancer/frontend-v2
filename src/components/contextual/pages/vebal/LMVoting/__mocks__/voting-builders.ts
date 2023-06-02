import { aPoolToken } from '@/__mocks__/weighted-pool';
import { PoolType } from '@/services/pool/types';

import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { VotingGauge } from '@/constants/voting-gauges';
import { Network } from '@/lib/config';

type VotingGaugePool = VotingGauge['pool'];

export const veBALVotingGaugePool = aVotingGaugePool();

const defaultVotingGauge: Partial<VotingGauge> = {
  addedTimestamp: 1648465251,
  address: '0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b',
  network: Network.MAINNET,
  pool: veBALVotingGaugePool,
  relativeWeightCap: 'null',
  tokenLogoURIs: {
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25':
      'https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png',
  },
};

export function aVotingGauge(...options: Partial<VotingGauge>[]): VotingGauge {
  return Object.assign({}, defaultVotingGauge, ...options);
}

export function aWeightedVotingGauge(
  ...options: Partial<VotingGauge>[]
): VotingGauge {
  const defaultGauge: VotingGauge = aVotingGauge({
    address: '0x896596539966e06beea751801cf15f7aad0aa6c8',
    pool: aWeightedVotingGaugePool(),
  });
  return Object.assign({}, defaultGauge, ...options);
}

export function aVotingGaugePool(
  ...options: Partial<VotingGaugePool>[]
): VotingGaugePool {
  const defaultPool: Partial<VotingGaugePool> = {
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    poolType: PoolType.Stable,
    symbol: 'veBAL',
    tokens: [
      aPoolToken({
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        symbol: 'veBAL',
        weight: 'null',
      }),
    ],
  };
  return Object.assign({}, defaultPool, ...options);
}

export function aWeightedVotingGaugePool(
  ...options: Partial<VotingGaugePool>[]
): VotingGaugePool {
  const pool = aWeightedPool();
  const defaultWeightedVotingPool: Partial<VotingGaugePool> = {
    address: pool.address,
    id: pool.id,
    poolType: PoolType.Weighted,
    symbol: 'TEST VOTING WEIGHTED POOL',
    tokens: pool.tokens,
  };
  return Object.assign({}, defaultWeightedVotingPool, ...options);
}
