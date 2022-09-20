import { Network } from '@balancer-labs/sdk';

import { PoolToken } from '@/services/pool/types';
import { PoolType } from '@/services/pool/types';

import ALL_VOTING_GAUGES from '../../public/data/voting-gauges.json';

export type VotingGauge = {
  address: string;
  network: Network;
  addedTimestamp: number;
  relativeWeightCap: string;
  pool: {
    id: string;
    address: string;
    poolType: PoolType;
    symbol: string | undefined;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string | undefined>;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = (
  ALL_VOTING_GAUGES as VotingGauge[]
).filter(gauge => gauge.network === Network.KOVAN);

export const GOERLI_VOTING_GAUGES: VotingGauge[] = (
  ALL_VOTING_GAUGES as VotingGauge[]
).filter(gauge => gauge.network === Network.GOERLI);

export const MAINNET_VOTING_GAUGES: VotingGauge[] = (
  ALL_VOTING_GAUGES as VotingGauge[]
).filter(
  gauge => gauge.network !== Network.KOVAN && gauge.network !== Network.GOERLI
);

export const VEBAL_VOTING_GAUGE: VotingGauge | undefined = (
  ALL_VOTING_GAUGES as VotingGauge[]
).find(gauge => gauge.pool.symbol === 'veBAL');
