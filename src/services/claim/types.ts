import { Claim } from '@/types';

export type Snapshot = Record<number, string>;

export type TokenClaimInfo = {
  label: string;
  rewarder: string;
  token: string;
  manifest: string;
};

export type MultiTokenPendingClaims = {
  claims: Claim[];
  reports: Report;
  tokenClaimInfo: TokenClaimInfo;
  availableToClaim: string;
};

export type ClaimStatus = boolean;

export type Report = Record<string, any>;

export type MultiTokenCurrentRewardsEstimateResponse = {
  success: boolean;
  result: {
    current_timestamp: string;
    'liquidity-providers': Array<{
      snapshot_timestamp: string;
      address: string;
      token_address: string;
      chain_id: number;
      current_estimate: string;
      velocity: string;
      week: number;
    }>;
  };
};

export type MultiTokenCurrentRewardsEstimate = {
  rewards: string;
  velocity: string;
  token: string;
};

export type ClaimProofTuple = [number, string, string[]];

export type ComputeClaimProofPayload = {
  tokenPendingClaims: MultiTokenPendingClaims;
  account: string;
};

export type ClaimWorkerMessage = {
  type: 'computeClaimProofs';
  payload: ComputeClaimProofPayload;
};
