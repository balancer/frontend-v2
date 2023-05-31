import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultExactInJoin,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { aTokenInfo } from '@/types/TokenList.builders';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import {
  anAmountIn,
  buildJoinParams,
} from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { ExactInJoinHandler } from './exact-in-join.handler';
import { JoinParams } from './join-pool.handler';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

async function mountExactInJoinHandler(pool: Pool) {
  return new ExactInJoinHandler(ref(pool), getBalancerSDK());
}

const joinParams: JoinParams = buildJoinParams({
  amountsIn: [
    anAmountIn({ address: groAddress, value: '20' }),
    anAmountIn({ address: wethAddress, value: '20' }),
  ],
  tokensIn: {
    [groAddress]: aTokenInfo({ address: groAddress }),
    [wethAddress]: aTokenInfo({ address: wethAddress }),
  },
});

test('Successfully queries an Exact In join', async () => {
  const handler = await mountExactInJoinHandler(aWeightedPool());

  const queryOutput = await handler.queryJoin(joinParams);

  expect(queryOutput).toEqual({
    bptOut: '0.00000000000000003', // formatFixed defaultExpectedBptOut
    priceImpact: 1, // Number(formatFixed(evmPriceImpact, 18)) where evmPriceImpact is defaultPriceImpact
  });
});

test('Successfully executes an exact in join transaction', async () => {
  const handler = await mountExactInJoinHandler(aWeightedPool());
  const joinResult = await handler.join(joinParams);

  expect(joinResult).toEqual(defaultTransactionResponse);

  expect(joinParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultExactInJoin.data,
    to: defaultExactInJoin.to,
    value: defaultExactInJoin.value,
    gasLimit: defaultGasLimit,
  });
});
