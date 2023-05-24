import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultExactInExit as defaultExactInExit,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { aTokenInfo } from '@/types/TokenList.builders';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { nativeAssetAddress } from '@tests/unit/builders/address';
import { buildExitParams } from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { ExactOutExitHandler } from './exact-out-exit.handler';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

async function mountExactOutExitHandler(pool: Pool) {
  return new ExactOutExitHandler(ref(pool), getBalancerSDK());
}

test('Successfully executes an exact-out exit transaction', async () => {
  const exitParams = buildExitParams({
    bptIn: '0.00000000000000001',
  });
  const handler = await mountExactOutExitHandler(aWeightedPool());

  const exitResult = await handler.exit(exitParams);

  expect(exitResult).toEqual(defaultTransactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultExactInExit.data,
    to: defaultExactInExit.to,
    gasLimit: defaultGasLimit,
  });
});

test('Successfully executes an exact-out exit transaction with native asset (ETH)', async () => {
  const exitParams = buildExitParams({
    bptIn: '0.00000000000000001',
  });
  //Change address to be native asset address
  exitParams.amountsOut[0].address = nativeAssetAddress;
  exitParams.tokenInfo[nativeAssetAddress] = aTokenInfo({
    address: nativeAssetAddress,
  });
  const handler = await mountExactOutExitHandler(aWeightedPool());

  const exitResult = await handler.exit(exitParams);

  expect(exitResult).toEqual(defaultTransactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultExactInExit.data,
    to: defaultExactInExit.to,
    gasLimit: defaultGasLimit,
  });
});
