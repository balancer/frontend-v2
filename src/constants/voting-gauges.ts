import { Network } from '@balancer-labs/sdk';

import { PoolToken } from '@/services/pool/types';
import { PoolType } from '@/services/pool/types';

import ALL_VOTING_GAUGES from '../../public/data/voting-gauges.json';

export type RootGauge = {
  id: string;
  recipient?: string;
  isKilled?: boolean;
  relativeWeightCap?: string;
};

export type VotingGauges = {
  preferentialGauge: RootGauge;
  gauges: RootGauge[];
};

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
  gauges: VotingGauges | null;
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
