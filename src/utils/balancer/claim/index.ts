import { toWei } from 'web3-utils';
import { ipfsGet } from '@/utils/balancer/ipfs';
import { call } from '@/utils/balancer/web3';
import { abi } from './MerkleRedeem.json';

const gateway = process.env.VUE_APP_IPFS_NODE || 'ipfs.io';

export const constants = {
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

export async function getSnapshot(network) {
  if (constants[network]?.snapshot)
    return (await ipfsGet(gateway, constants[network].snapshot, 'ipns')) || {};
  return {};
}

export async function getClaimStatus(network, provider, ids, address) {
  return await call(provider, abi, [
    constants[network].merkleRedeem,
    'claimStatus',
    [address, 1, ids]
  ]);
}

export async function getReports(snapshot, weeks) {
  const reports = await Promise.all(
    weeks.map(week => ipfsGet(gateway, snapshot[week]))
  );
  return Object.fromEntries(reports.map((report, i) => [weeks[i], report]));
}

export async function getPendingClaims(network, provider, address) {
  const snapshot = await getSnapshot(network);

  const claimStatus = await getClaimStatus(
    network,
    provider,
    Object.keys(snapshot).length,
    address
  );
  const pending = claimStatus
    .map((status, i) => [i + 1, status])
    .filter(([, status]) => status === false)
    .map(([i]) => i);

  const reports = await getReports(snapshot, pending);

  return Object.entries(reports).map((report: any) => {
    return {
      id: report[0],
      amount: report[1][address],
      amountDenorm: toWei(report[1][address])
    };
  });
}
