// import { soliditySha3, toWei } from 'web3-utils';
import { toWei } from 'web3-utils';
import {
  sendTransaction,
  call,
  ipfsGet
} from '@snapshot-labs/snapshot.js/src/utils';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
// import { loadTree } from '@/utils/balancer/claim/merkle';
import { abi } from './MerkleRedeem.json';

const gateway = process.env.VUE_APP_IPFS_NODE || gateways[0];

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

export async function claimWeeks(network, web3, address, pendingClaims) {
  const claims = pendingClaims.map(claim => [
    parseInt(claim.id),
    claim.amountDenorm,
    claim.proof
  ]);
  return await sendTransaction(
    web3,
    constants[network].merkleRedeem,
    abi,
    'claimWeeks',
    [address, claims]
  );
}

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
    // const merkleTree = loadTree(report[1]);
    return {
      id: report[0],
      amount: report[1][address],
      amountDenorm: toWei(report[1][address])
      // proof: merkleTree.getHexProof(soliditySha3(address, toWei(report[1][address])))
    };
  });
}
