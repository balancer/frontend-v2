// Shamelessly adapted from OpenZeppelin-contracts test utils
import { toWei, soliditySha3 } from 'web3-utils';
import { loadTree } from '../../lib/utils/merkle';

import registerPromiseWorker from 'promise-worker/register';
import { ComputeClaimProofPayload, ClaimWorkerMessage } from './types';

registerPromiseWorker((message: ClaimWorkerMessage) => {
  if (message.type === 'computeClaimProofs') {
    const payload = message.payload as ComputeClaimProofPayload;
    const { tokenPendingClaims, account } = payload;

    return tokenPendingClaims.claims.map(week => {
      const claimBalance = week.amount;
      const merkleTree = loadTree(tokenPendingClaims.reports[week.id]);

      const proof = merkleTree.getHexProof(
        soliditySha3(account, toWei(claimBalance))
      ) as string[];

      return [parseInt(week.id), toWei(claimBalance), proof];
    });
  }
});
