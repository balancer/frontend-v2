// Shamelessly adapted from OpenZeppelin-contracts test utils
import { toWei, soliditySha3 } from 'web3-utils';
import { loadTree } from '../../lib/utils/merkle';

import registerPromiseWorker from 'promise-worker/register';
import { ClaimWorkerMessage, ComputeClaimProofPayload } from './types';

registerPromiseWorker((message: ClaimWorkerMessage) => {
  if (message.type === 'computeClaimProof') {
    const payload = message.payload as ComputeClaimProofPayload;
    const { report, account, claim } = payload;

    const claimBalance = claim.amount;
    const merkleTree = loadTree(report);

    const proof = merkleTree.getHexProof(
      soliditySha3(account, toWei(claimBalance))
    ) as string[];

    return [parseInt(claim.id), toWei(claimBalance), proof];
  }
});
