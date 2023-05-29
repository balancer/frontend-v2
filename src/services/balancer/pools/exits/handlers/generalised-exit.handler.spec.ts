import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultGeneralizedExitResponse,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { buildExitParams } from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';

import { GeneralisedExitHandler } from './generalised-exit.handler';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

async function mountGeneralizedExitHandler(pool: Pool) {
  return new GeneralisedExitHandler(ref(pool), getBalancerSDK());
}

const exitParams = buildExitParams({ bptIn: '1' });

test('Successfully executes a generalized exit transaction', async () => {
  const handler = await mountGeneralizedExitHandler(BoostedPoolMock);

  await handler.queryExit(exitParams);

  const joinResult = await handler.exit(exitParams);

  expect(joinResult).toEqual(defaultTransactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultGeneralizedExitResponse.encodedCall,
    to: defaultGeneralizedExitResponse.to,
    gasLimit: defaultGasLimit,
  });
});
