import { PoolToken } from '@/services/balancer/subgraph/types';

import ALL_VOTING_GAUGES from '../../public/data/voting-gauges.json';

export type VotingGauge = {
  address: string;
  network: number;
  pool: {
    id: string;
    address: string;
    poolType: string;
    symbol: string | undefined;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string | undefined>;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = (ALL_VOTING_GAUGES as VotingGauge[]).filter(
  gauge => gauge.network === 42
);

export const MAINNET_VOTING_GAUGES = ALL_VOTING_GAUGES.filter(
  gauge => gauge.network !== 42
);
