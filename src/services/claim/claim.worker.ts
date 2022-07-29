// Shamelessly adapted from OpenZeppelin-contracts test utils
import registerPromiseWorker from 'promise-worker/register';
import { soliditySha3 } from 'web3-utils';

import { scale } from '@/lib/utils';

import { loadTree } from '../../lib/utils/merkle';
import { ClaimWorkerMessage, ComputeClaimProofPayload } from './types';

registerPromiseWorker((message: ClaimWorkerMessage) => {
  if (message.type === 'computeClaimProof') {
    const payload = message.payload as ComputeClaimProofPayload;
    const { report, account, claim, distributor, tokenIndex, decimals } =
      payload;

    const claimAmount = claim.amount;
    const merkleTree = loadTree(report, decimals);

    const scaledBalance = scale(claimAmount, decimals).toString(10);

    const proof = merkleTree.getHexProof(
      soliditySha3(
        { t: 'address', v: account },
        { t: 'uint', v: scaledBalance }
      )
    ) as string[];

    return [parseInt(claim.id), scaledBalance, distributor, tokenIndex, proof];
  }
});
