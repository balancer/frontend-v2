import { Network } from '@balancer-labs/sdk';
import { PoolToken, PoolType } from '@/services/pool/types';

// voting-gauges.json is inside src
// If we wanted to make it static (public folder) we should use an async import like this solution shows:
// https://stackoverflow.com/questions/74344683/how-to-import-a-json-file-from-public-directory-with-vite/74345564#74345564
import ALL_VOTING_GAUGES from '@/data/voting-gauges.json';

export type VotingGauge = {
  address: string;
  network: Network;
  isKilled: boolean;
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

export const GOERLI_VOTING_GAUGES: VotingGauge[] = (
  ALL_VOTING_GAUGES as VotingGauge[]
).filter(gauge => gauge.network === Network.GOERLI);

export const MAINNET_VOTING_GAUGES: VotingGauge[] = (
  ALL_VOTING_GAUGES as VotingGauge[]
).filter(gauge => gauge.network !== Network.GOERLI);

export const VEBAL_VOTING_GAUGE: VotingGauge | undefined = (
  ALL_VOTING_GAUGES as VotingGauge[]
).find(gauge => gauge.pool.symbol === 'veBAL');
