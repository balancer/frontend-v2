import { Network } from '@disscorp/sdk';

import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';

import ALL_VOTING_GAUGES from '../../public/data/voting-gauges.json';

export type VotingGauge = {
  address: string;
  network: Network;
  pool: {
    id: string;
    address: string;
    poolType: PoolType;
    symbol: string | undefined;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string | undefined>;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = (ALL_VOTING_GAUGES as VotingGauge[]).filter(
  gauge => gauge.network === Network.KOVAN
);

export const MAINNET_VOTING_GAUGES: VotingGauge[] = (ALL_VOTING_GAUGES as VotingGauge[]).filter(
  gauge => gauge.network !== Network.KOVAN
);
