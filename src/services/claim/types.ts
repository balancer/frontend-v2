import { Claim } from '@/types';

export type Snapshot = Record<number, string>;

export type TokenClaimInfo = {
  label: string;
  distributor: string;
  token: string;
  decimals: number;
  manifest: string;
  weekStart: number;
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

export type ClaimProofTuple = [number, string, string, number, string[]]; // claimId, claimAmount, distributor, tokenIndex, proof

export type ComputeClaimProofPayload = {
  report: Report;
  account: string;
  claim: Claim;
  distributor: string;
  tokenIndex: number;
  decimals: number;
};

export type ClaimWorkerMessage<P = any> = {
  type: 'computeClaimProof';
  payload: P;
};
