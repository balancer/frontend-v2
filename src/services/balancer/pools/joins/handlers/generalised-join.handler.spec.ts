import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultGeneralizedJoinResponse,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { buildJoinParams } from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { ref } from 'vue';
import { GeneralisedJoinHandler } from './generalised-join.handler';

initBalancerSdkWithDefaultMocks();

async function mountGeneralizedJoinHandler(pool: Pool) {
  return new GeneralisedJoinHandler(ref(pool), getBalancerSDK());
}

const joinParams = buildJoinParams();

test('Successfully executes a generalized join transaction', async () => {
  const handler = await mountGeneralizedJoinHandler(BoostedPoolMock);
  const joinResult = await handler.join(joinParams);

  expect(joinResult).toEqual(defaultTransactionResponse);
  expect(joinParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultGeneralizedJoinResponse.encodedCall,
    to: defaultGeneralizedJoinResponse.to,
    gasLimit: defaultGasLimit,
  });
});
