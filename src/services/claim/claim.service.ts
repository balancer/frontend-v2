import axios from 'axios';
import { chunk, flatten, groupBy } from 'lodash';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import merkleOrchardAbi from '@/lib/abi/MerkleOrchard.json';
import { ethers } from 'ethers';

import { getAddress } from '@ethersproject/address';

import { networkId } from '@/composables/useNetwork';

import { sendTransaction } from '@/lib/utils/balancer/web3';
import { multicall } from '@/lib/utils/balancer/contract';
import { bnum } from '@/lib/utils';
import configs from '@/lib/config';

import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { ipfsService } from '@/services/ipfs/ipfs.service';

import MultiTokenClaim from './MultiTokenClaim.json';

import {
  ClaimProofTuple,
  ClaimStatus,
  ClaimWorkerMessage,
  ComputeClaimProofPayload,
  MultiTokenCurrentRewardsEstimate,
  MultiTokenCurrentRewardsEstimateResponse,
  MultiTokenPendingClaims,
  Report,
  Snapshot,
  TokenClaimInfo
} from './types';
import { claimWorkerPoolService } from './claim-worker-pool.service';

import { configService } from '../config/config.service';

export class ClaimService {
  public async getMultiTokensPendingClaims(
    account: string
  ): Promise<MultiTokenPendingClaims[]> {
    const tokenClaimsInfo = this.getTokenClaimsInfo();
    if (tokenClaimsInfo != null) {
      const multiTokenPendingClaims = await Promise.all(
        tokenClaimsInfo.map(tokenClaimInfo =>
          this.getTokenPendingClaims(tokenClaimInfo, account)
        )
      );

      const multiTokenPendingClaimsWithRewards = multiTokenPendingClaims.filter(
        pendingClaim => Number(pendingClaim.availableToClaim) > 0
      );

      return multiTokenPendingClaimsWithRewards;
    }
    return [];
  }

  public async getTokenPendingClaims(
    tokenClaimInfo: TokenClaimInfo,
    account: string
  ): Promise<MultiTokenPendingClaims> {
    const snapshot = await this.getSnapshot(tokenClaimInfo.manifest);
    const weekStart = tokenClaimInfo.weekStart;
    const claimStatus = await this.getClaimStatus(
      Object.keys(snapshot).length,
      account,
      tokenClaimInfo
    );

    const pendingWeeks = claimStatus
      .map((status, i) => [i + weekStart, status])
      .filter(([, status]) => !status)
      .map(([i]) => i) as number[];

    const reports = await this.getReports(snapshot, pendingWeeks);

    const claims = Object.entries(reports)
      .filter((report: Report) => report[1][account])
      .map((report: Report) => {
        return {
          id: report[0],
          amount: report[1][account]
        };
      });

    const availableToClaim = claims
      .map(claim => parseFloat(claim.amount))
      .reduce((total, amount) => total.plus(amount), bnum(0))
      .toString();

    return {
      claims,
      reports,
      tokenClaimInfo,
      availableToClaim
    };
  }

  public async getMultiTokensCurrentRewardsEstimate(
    account: string
  ): Promise<{
    data: MultiTokenCurrentRewardsEstimate[];
    timestamp: string | null;
  }> {
    try {
      const response = await axios.get<
        MultiTokenCurrentRewardsEstimateResponse
      >(
        `https://api.balancer.finance/liquidity-mining/v1/liquidity-provider-multitoken/${account}`
      );
      if (response.data.success) {
        const multiTokenLiquidityProviders = response.data.result[
          'liquidity-providers'
        ]
          .filter(incentive => incentive.chain_id === networkId.value)
          .map(incentive => ({
            ...incentive,
            token_address: getAddress(incentive.token_address)
          }));

        const multiTokenCurrentRewardsEstimate: MultiTokenCurrentRewardsEstimate[] = [];

        const multiTokenLiquidityProvidersByToken = Object.entries(
          groupBy(multiTokenLiquidityProviders, 'token_address')
        );

        for (const [
          token,
          liquidityProvider
        ] of multiTokenLiquidityProvidersByToken) {
          const rewards = liquidityProvider
            .reduce(
              (total, { current_estimate }) => total.plus(current_estimate),
              bnum(0)
            )
            .toString();

          const velocity =
            liquidityProvider
              .find(liquidityProvider => Number(liquidityProvider.velocity) > 0)
              ?.velocity.toString() ?? '0';

          if (Number(rewards) > 0) {
            multiTokenCurrentRewardsEstimate.push({
              rewards,
              velocity,
              token: getAddress(token)
            });
          }
        }

        return {
          data: multiTokenCurrentRewardsEstimate,
          timestamp: response.data.result.current_timestamp
        };
      }
    } catch (e) {
      console.log('[Claim] Current Rewards Estimate Error', e);
    }
    return {
      data: [],
      timestamp: null
    };
  }

  public async multiTokenClaimRewards(
    provider: Web3Provider,
    account: string,
    multiTokenPendingClaims: MultiTokenPendingClaims[]
  ): Promise<TransactionResponse> {
    try {
      const tokens = multiTokenPendingClaims.map(
        tokenPendingClaims => tokenPendingClaims.tokenClaimInfo.token
      );

      const multiTokenClaims = await Promise.all(
        multiTokenPendingClaims.map((tokenPendingClaims, tokenIndex) =>
          this.computeClaimProofs(tokenPendingClaims, account, tokenIndex)
        )
      );

      return sendTransaction(
        provider,
        configs[networkId.value].addresses.merkleOrchard,
        merkleOrchardAbi,
        'claimDistributions',
        [account, flatten(multiTokenClaims), tokens]
      );
    } catch (e) {
      console.log('[Claim] Claim Rewards Error:', e);
      return Promise.reject(e);
    }
  }

  private async computeClaimProofs(
    tokenPendingClaims: MultiTokenPendingClaims,
    account: string,
    tokenIndex: number
  ): Promise<Promise<ClaimProofTuple[]>> {
    return Promise.all(
      tokenPendingClaims.claims.map(claim => {
        const payload: ComputeClaimProofPayload = {
          account,
          distributor: tokenPendingClaims.tokenClaimInfo.distributor,
          tokenIndex,
          // objects must be cloned
          report: { ...tokenPendingClaims.reports[claim.id] },
          claim: { ...claim }
        };

        return this.computeClaimProof(payload);
      })
    );
  }

  private computeClaimProof(
    payload: ComputeClaimProofPayload
  ): Promise<ClaimProofTuple> {
    const message: ClaimWorkerMessage<ComputeClaimProofPayload> = {
      type: 'computeClaimProof',
      payload
    };

    return claimWorkerPoolService.worker.postMessage<ClaimProofTuple>(message);
  }

  private getTokenClaimsInfo() {
    const tokenClaims = MultiTokenClaim[networkId.value];
    if (tokenClaims != null) {
      return (tokenClaims as TokenClaimInfo[]).map(tokenClaim => ({
        ...tokenClaim,
        token: getAddress(tokenClaim.token)
      }));
    }

    return null;
  }

  private async getSnapshot(manifest: string) {
    const response = await axios.get<Snapshot>(manifest);

    return response.data || {};
  }

  private async getClaimStatus(
    totalWeeks: number,
    account: string,
    tokenClaimInfo: TokenClaimInfo
  ): Promise<ClaimStatus[]> {
    const { token, distributor, weekStart } = tokenClaimInfo;

    const claimStatusCalls = Array.from({ length: totalWeeks }).map((_, i) => [
      configService.network.addresses.merkleOrchard,
      'isClaimed',
      [token, distributor, weekStart + i, account]
    ]);

    const rootCalls = Array.from({ length: totalWeeks }).map((_, i) => [
      configService.network.addresses.merkleOrchard,
      'getDistributionRoot',
      [token, distributor, weekStart + i]
    ]);

    try {
      const result = (await multicall(
        String(networkId.value),
        rpcProviderService.jsonProvider,
        merkleOrchardAbi,
        [...claimStatusCalls, ...rootCalls]
      )) as [boolean | string][];

      if (result.length > 0) {
        const chunks = chunk(flatten(result), totalWeeks);

        const claimedResult = chunks[0] as boolean[];
        const distributionRootResult = chunks[1] as string[];

        return claimedResult.filter(
          (_, index) =>
            distributionRootResult[index] !== ethers.constants.HashZero
        );
      }
    } catch (e) {
      console.log('[Claim] Claim Status Error:', e);
    }

    return [];
  }

  private async getReports(snapshot: Snapshot, weeks: number[]) {
    const reports = await Promise.all<Report>(
      weeks
        .filter(week => snapshot[week] != null)
        .map(week => ipfsService.get(snapshot[week]))
    );
    return Object.fromEntries(reports.map((report, i) => [weeks[i], report]));
  }
}

export const claimService = new ClaimService();
