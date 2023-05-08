import { getAddress } from '@ethersproject/address';
import { TransactionResponse } from '@ethersproject/providers';
import { WalletProvider } from '@/dependencies/wallets/Web3Provider';

import axios from 'axios';
import { ethers } from 'ethers';
import { chunk, flatten } from 'lodash';

import { networkId } from '@/composables/useNetwork';
import merkleOrchardAbi from '@/lib/abi/MerkleOrchard.json';
import { bnum } from '@/lib/utils';
import { multicall } from '@/lib/utils/balancer/contract';
import { ipfsService } from '@/services/ipfs/ipfs.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { configService } from '../config/config.service';
import { claimWorkerPoolService } from './claim-worker-pool.service';
import MerkleOrchardV1Config from './MerkleOrchardV1Config.json';
import MerkleOrchardV2Config from './MerkleOrchardV2Config.json';
import TokenDecimals from './TokenDecimals.json';
import {
  ClaimProofTuple,
  ClaimStatus,
  ClaimWorkerMessage,
  ComputeClaimProofPayload,
  MultiTokenPendingClaims,
  Report,
  Snapshot,
  TokenClaimInfo,
} from './types';
import { TransactionBuilder } from '../web3/transactions/transaction.builder';

export enum MerkleOrchardVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export class ClaimService {
  merkleOrchardConfig: any;
  merkleOrchardAddress: string;

  constructor(
    public readonly merkleOrchardVersion: MerkleOrchardVersion = MerkleOrchardVersion.V1
  ) {
    switch (merkleOrchardVersion) {
      case MerkleOrchardVersion.V1:
        this.merkleOrchardConfig = MerkleOrchardV1Config;
        this.merkleOrchardAddress =
          configService.network.addresses.merkleOrchard;
        break;
      case MerkleOrchardVersion.V2:
        if (!configService.network.addresses.merkleOrchardV2) {
          throw new Error('Merkle Orchard V2 not deployed on this network');
        }
        this.merkleOrchardConfig = MerkleOrchardV2Config;
        this.merkleOrchardAddress = configService.network.addresses
          .merkleOrchardV2 as string;
        break;
      default:
        throw new Error('Invalid Merkle Orchard version');
    }
  }

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
          amount: report[1][account],
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
      availableToClaim,
    };
  }
  public async multiTokenClaimRewards(
    provider: WalletProvider,
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

      const txBuilder = new TransactionBuilder(provider.getSigner());
      return await txBuilder.contract.sendTransaction({
        contractAddress: this.merkleOrchardAddress,
        abi: merkleOrchardAbi,
        action: 'claimDistributions',
        params: [account, flatten(multiTokenClaims), tokens],
      });
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
          decimals: tokenPendingClaims.tokenClaimInfo.decimals,
          // objects must be cloned
          report: { ...tokenPendingClaims.reports[claim.id] },
          claim: { ...claim },
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
      payload,
    };

    return claimWorkerPoolService.worker.postMessage<ClaimProofTuple>(message);
  }

  private getTokenClaimsInfo() {
    const tokenClaims = this.merkleOrchardConfig[networkId.value];
    const tokenDecimals = TokenDecimals[networkId.value];

    if (tokenClaims != null) {
      return (tokenClaims as TokenClaimInfo[]).map(tokenClaim => ({
        ...tokenClaim,
        token: getAddress(tokenClaim.token),
        decimals:
          tokenDecimals != null && tokenDecimals[tokenClaim.token]
            ? tokenDecimals[tokenClaim.token]
            : 18,
      }));
    }

    return null;
  }

  private async getSnapshot(manifest: string) {
    try {
      const response = await axios.get<Snapshot>(manifest);
      return response.data || {};
    } catch (error) {
      return {};
    }
  }

  private async getClaimStatus(
    totalWeeks: number,
    account: string,
    tokenClaimInfo: TokenClaimInfo
  ): Promise<ClaimStatus[]> {
    const { token, distributor, weekStart } = tokenClaimInfo;

    const claimStatusCalls = Array.from({ length: totalWeeks }).map((_, i) => [
      this.merkleOrchardAddress,
      'isClaimed',
      [token, distributor, weekStart + i, account],
    ]);

    const rootCalls = Array.from({ length: totalWeeks }).map((_, i) => [
      this.merkleOrchardAddress,
      'getDistributionRoot',
      [token, distributor, weekStart + i],
    ]);

    try {
      const result = (await multicall<boolean | string>(
        String(networkId.value),
        rpcProviderService.jsonProvider,
        merkleOrchardAbi,
        [...claimStatusCalls, ...rootCalls],
        {},
        true
      )) as (boolean | string)[];

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
