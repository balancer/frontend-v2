// Shamelessly adapted from OpenZeppelin-contracts test utils
import { toWei, soliditySha3 } from 'web3-utils';
import { loadTree } from '../../lib/utils/merkle';
import { scale } from '@/lib/utils';

import registerPromiseWorker from 'promise-worker/register';
import { ClaimWorkerMessage, ComputeClaimProofPayload } from './types';

registerPromiseWorker((message: ClaimWorkerMessage) => {
  if (message.type === 'computeClaimProof') {
    const payload = message.payload as ComputeClaimProofPayload;
    const { report, account, claim, distributor, tokenIndex, decimals } = payload;

    const claimAmount = claim.amount;
    const merkleTree = loadTree(report, decimals);

    const proof = merkleTree.getHexProof(
      soliditySha3(account, scale(claimAmount, decimals))
    ) as string[];

    return [
      parseInt(claim.id),
      scale(claimAmount, decimals),
      distributor,
      tokenIndex,
      proof
    ];
  }
});
