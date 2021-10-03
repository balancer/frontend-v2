import axios from 'axios';
import { groupBy } from 'lodash';
import { parseUnits } from '@ethersproject/units';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { MerkleRedeem__factory } from '@balancer-labs/typechain';
import { toWei, soliditySha3 } from 'web3-utils';
import { getAddress } from '@ethersproject/address';

import { networkId } from '@/composables/useNetwork';

import { call, sendTransaction } from '@/lib/utils/balancer/web3';
import { bnum } from '@/lib/utils';
import { loadTree } from '@/lib/utils/merkle';
import configs from '@/lib/config';

import { ipfsService } from '../ipfs/ipfs.service';

import MultiTokenClaim from './MultiTokenClaim.json';

import {
  ClaimProofTuple,
  ClaimStatus,
  MultiTokenCurrentRewardsEstimate,
  MultiTokenCurrentRewardsEstimateResponse,
  MultiTokenPendingClaims,
  Report,
  Snapshot,
  TokenClaimInfo
} from './types';

export class ClaimService {
  public async getMultiTokensPendingClaims(
    provider: Web3Provider,
    account: string
  ): Promise<MultiTokenPendingClaims[]> {
    const tokenClaimsInfo = this.getTokenClaimsInfo();
    if (tokenClaimsInfo != null) {
      const multiTokenPendingClaims = await Promise.all(
        tokenClaimsInfo.map(tokenClaimInfo =>
          this.getTokenPendingClaims(tokenClaimInfo, provider, account)
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
    provider: Web3Provider,
    account: string
  ): Promise<MultiTokenPendingClaims> {
    const snapshot = await this.getSnapshot(tokenClaimInfo.manifest);

    const claimStatus = await this.getClaimStatus(
      provider,
      Object.keys(snapshot).length,
      account,
      tokenClaimInfo.rewarder
    );

    const pendingWeeks = claimStatus
      .map((status, i) => [i + 1, status])
      .filter(([, status]) => !status)
      .map(([i]) => i) as number[];

    const reports = await this.getReports(snapshot, pendingWeeks);
    const claims = Object.entries(reports)
      .filter((report: Report) => report[1][account])
      .map((report: Report) => {
        return {
          id: report[0],
          amount: report[1][account],
          amountDenorm: parseUnits(report[1][account], 18)
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
  ): Promise<MultiTokenCurrentRewardsEstimate[]> {
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

          if (Number(velocity) > 0) {
            multiTokenCurrentRewardsEstimate.push({
              rewards,
              velocity,
              timestamp: response.data.result.current_timestamp,
              token: getAddress(token)
            });
          }
        }

        return multiTokenCurrentRewardsEstimate;
      }
    } catch (e) {
      console.log('[Claim] Current Rewards Estimate Error', e);
    }
    return [];
  }

  public async multiTokenClaimRewards(
    provider: Web3Provider,
    account: string,
    multiTokenPendingClaims: MultiTokenPendingClaims[]
  ): Promise<TransactionResponse> {
    try {
      const multiTokenClaims: ClaimProofTuple[] = [];

      multiTokenPendingClaims.forEach(tokenPendingClaims => {
        const tokenClaims = this.computeClaimProofs(
          tokenPendingClaims,
          account
        );
        multiTokenClaims.push(...tokenClaims);
      });

      return sendTransaction(
        provider,
        configs[networkId.value].addresses.merkleRedeem,
        MerkleRedeem__factory.abi,
        'claimWeeks',
        [account, multiTokenClaims]
      );
    } catch (e) {
      console.log('[Claim] Claim Rewards Error:', e);
      return Promise.reject(e);
    }
  }

  private computeClaimProofs(
    tokenPendingClaims: MultiTokenPendingClaims,
    account: string
  ): ClaimProofTuple[] {
    const reports = tokenPendingClaims.reports;

    return tokenPendingClaims.claims.map(week => {
      const claimBalance = week.amount;
      const merkleTree = loadTree(reports[week.id]);

      const proof = merkleTree.getHexProof(
        soliditySha3(account, toWei(claimBalance))
      ) as string[];

      return [parseInt(week.id), toWei(claimBalance), proof];
    });
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
    provider: Web3Provider,
    ids: number,
    account: string,
    rewarder: string
  ): Promise<ClaimStatus[]> {
    return await call(provider, MerkleRedeem__factory.abi, [
      rewarder,
      'claimStatus',
      [account, 1, ids]
    ]);
  }

  private async getReports(snapshot: Snapshot, weeks: number[]) {
    const reports = await Promise.all<Report>(
      weeks.map(week => ipfsService.get(snapshot[week]))
    );
    return Object.fromEntries(reports.map((report, i) => [weeks[i], report]));
  }
}

export const claimService = new ClaimService();
