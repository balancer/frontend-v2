import { parseUnits } from '@ethersproject/units';
import { TransactionResponse, JsonRpcProvider } from '@ethersproject/providers';
import { toWei, soliditySha3 } from 'web3-utils';
import axios from 'axios';

import { NetworkId } from '@/constants/network';

import { Claim } from '@/types';

import { ipfsGet } from '@/lib/utils/balancer/ipfs';
import { call, sendTransaction } from '@/lib/utils/balancer/web3';
import { bnum } from '@/lib/utils';
import { loadTree } from '@/lib/utils/merkle';
import configs from '@/lib/config';
import { getOriginalAddress } from '@/services/coingecko';
import { TOKENS } from '@/constants/tokens';

import merkleRedeemAbi from '@/lib/abi/MerkleRedeem.json';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

type Snapshot = Record<number, string>;

// @ts-ignore
export const constants: Record<NetworkId, Record<string, string>> = {
  1: {
    merkleRedeem: '0x6d19b2bF3A36A61530909Ae65445a906D98A2Fa8',
    snapshot: 'balancer-team-bucket.storage.fleek.co/balancer-claim/snapshot'
  },
  42: {
    merkleRedeem: '0x3bc73D276EEE8cA9424Ecb922375A0357c1833B3',
    snapshot:
      'balancer-team-bucket.storage.fleek.co/balancer-claim-kovan/snapshot'
  }
};

export async function getSnapshot(network: NetworkId) {
  if (constants[network]?.snapshot) {
    return (await ipfsGet(gateway, constants[network].snapshot, 'ipns')) || {};
  }
  return {};
}

type ClaimStatus = boolean;

export async function getClaimStatus(
  network: NetworkId,
  provider: JsonRpcProvider,
  ids: number,
  account: string
): Promise<ClaimStatus[]> {
  return await call(provider, merkleRedeemAbi, [
    constants[network].merkleRedeem,
    'claimStatus',
    [account, 1, ids]
  ]);
}

export type Report = Record<string, any>;

export async function getReports(snapshot: Snapshot, weeks: number[]) {
  const reports = await Promise.all<Report>(
    weeks.map(week => ipfsGet(gateway, snapshot[week]))
  );
  return Object.fromEntries(reports.map((report, i) => [weeks[i], report]));
}

export async function getPendingClaims(
  network: NetworkId,
  provider: JsonRpcProvider,
  account: string
): Promise<{ claims: Claim[]; reports: Report }> {
  if (!constants[network]) {
    return {
      claims: [],
      reports: {}
    };
  }
  const snapshot = await getSnapshot(network);

  const claimStatus = await getClaimStatus(
    network,
    provider,
    Object.keys(snapshot).length,
    account
  );

  const pendingWeeks = claimStatus
    .map((status, i) => [i + 1, status])
    .filter(([, status]) => !status)
    .map(([i]) => i) as number[];

  const pendingWeeksReports = await getReports(snapshot, pendingWeeks);

  return {
    claims: Object.entries(pendingWeeksReports)
      .filter((report: Report) => report[1][account])
      .map((report: Report) => {
        return {
          id: report[0],
          amount: report[1][account],
          amountDenorm: parseUnits(report[1][account], 18)
        };
      }),
    reports: pendingWeeksReports
  };
}

type CurrentRewardsEstimateResponse = {
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

export type CurrentRewardsEstimate = {
  rewards: string;
  velocity: string;
  timestamp: string;
} | null;

export async function getCurrentRewardsEstimate(
  network: NetworkId,
  account: string
): Promise<CurrentRewardsEstimate> {
  try {
    const response = await axios.get<CurrentRewardsEstimateResponse>(
      `https://api.balancer.finance/liquidity-mining/v1/liquidity-provider-multitoken/${account}`
    );
    if (response.data.success) {
      const liquidityProviders = response.data.result[
        'liquidity-providers'
      ].filter(
        incentive =>
          incentive.token_address ==
          getOriginalAddress(network, TOKENS.AddressMap.BAL).toLowerCase()
      );
      const rewards = liquidityProviders
        .reduce(
          (total, { current_estimate }) => total.plus(current_estimate),
          bnum(0)
        )
        .toString();
      const velocity =
        liquidityProviders
          .find(liquidityProvider => Number(liquidityProvider.velocity) > 0)
          ?.velocity.toString() ?? '0';

      if (Array.isArray(liquidityProviders)) {
        return {
          rewards,
          velocity,
          timestamp: response.data.result.current_timestamp
        };
      }
    }
  } catch (e) {
    console.log('[Claim] Current Rewards Estimate Error', e);
  }
  return null;
}

export async function claimRewards(
  network: NetworkId,
  provider: JsonRpcProvider,
  account: string,
  pendingClaims: Claim[],
  reports: Report
): Promise<TransactionResponse> {
  try {
    const claims = pendingClaims.map(week => {
      const claimBalance = week.amount;
      const merkleTree = loadTree(reports[week.id]);

      const proof = merkleTree.getHexProof(
        soliditySha3(account, toWei(claimBalance))
      );
      return [parseInt(week.id), toWei(claimBalance), proof];
    });

    return sendTransaction(
      provider,
      configs[network].addresses.merkleRedeem,
      merkleRedeemAbi,
      'claimWeeks',
      [account, claims]
    );
  } catch (e) {
    console.log('[Claim] Claim Rewards Error:', e);
    return Promise.reject(e);
  }
}
