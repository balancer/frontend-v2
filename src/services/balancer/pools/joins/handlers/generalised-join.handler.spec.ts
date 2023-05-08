import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import {
  defaultGeneralizedJoinResponse,
  initBalancerSdkWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { buildJoinParams } from '@tests/unit/builders/join-exit.builders';
import {
  defaultGasLimit,
  defaultTransactionResponse,
} from '@tests/unit/builders/signer';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { ref } from 'vue';
import { GeneralisedJoinHandler } from './generalised-join.handler';

initBalancerSdkWithDefaultMocks();

const gasPriceServiceMock: DeepMockProxy<GasPriceService> =
  mockDeep<GasPriceService>();

async function mountGeneralizedJoinHandler(pool: Pool) {
  return new GeneralisedJoinHandler(
    ref(pool),
    getBalancerSDK(),
    gasPriceServiceMock
  );
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
