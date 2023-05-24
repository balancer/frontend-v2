import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultExactInExit,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { buildExitParams } from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { ExactInExitHandler } from './exact-in-exit.handler';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

async function mountExactInExitHandler(pool: Pool) {
  return new ExactInExitHandler(ref(pool), getBalancerSDK());
}

const exitParams = buildExitParams({
  bptIn: '0.00000000000000001',
});

test('Successfully executes an exact-in exit transaction', async () => {
  const handler = await mountExactInExitHandler(aWeightedPool());

  const exitResult = await handler.exit(exitParams);

  expect(exitResult).toEqual(defaultTransactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultExactInExit.data,
    to: defaultExactInExit.to,
    gasLimit: defaultGasLimit,
  });
});
