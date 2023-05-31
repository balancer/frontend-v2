import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultRecoveryExit,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { aTokenInfo } from '@/types/TokenList.builders';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import {
  anAmountOut,
  buildExitParams,
} from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { ExitParams, ExitType } from './exit-pool.handler';
import { RecoveryExitHandler } from './recovery-exit.handler';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

async function mountRecoveryExitHandler(pool: Pool) {
  return new RecoveryExitHandler(ref(pool), getBalancerSDK());
}

const exitParams: ExitParams = buildExitParams({
  exitType: ExitType.GivenIn,
  bptIn: '40',
  amountsOut: [
    anAmountOut({ address: groAddress, value: '20' }),
    anAmountOut({ address: wethAddress, value: '20' }),
  ],
  tokenInfo: {
    [groAddress]: aTokenInfo({ address: groAddress }),
    [wethAddress]: aTokenInfo({ address: wethAddress }),
  },
});

defaultRecoveryExit.expectedAmountsOut = ['20', '20'];
defaultRecoveryExit.attributes.exitPoolRequest.assets = [
  groAddress,
  wethAddress,
];

test('Successfully queries a recovery exit', async () => {
  const handler = await mountRecoveryExitHandler(aWeightedPool());

  const queryOutput = await handler.queryExit(exitParams);

  expect(queryOutput).toEqual({
    amountsOut: {
      [groAddress]: '0.00000000000000002', // 20
      [wethAddress]: '0.00000000000000002', // 20
    },
    priceImpact: 1, // Number(formatFixed(evmPriceImpact, 18)) where evmPriceImpact is defaultPriceImpact
    txReady: true,
  });
});

test('Successfully executes a recovery exit transaction', async () => {
  const handler = await mountRecoveryExitHandler(aWeightedPool());

  const exitResult = await handler.exit(exitParams);

  expect(exitResult).toEqual(defaultTransactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultRecoveryExit.data,
    to: defaultRecoveryExit.to,
    gasLimit: defaultGasLimit,
  });
});
