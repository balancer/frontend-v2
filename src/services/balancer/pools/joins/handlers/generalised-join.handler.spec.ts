import { getBalancer } from '@/dependencies/balancer-sdk';
import {
  defaultGeneralizedJoinResponse,
  initBalancerWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { ref } from 'vue';
import { GeneralisedJoinHandler } from './generalised-join.handler';
import { JoinParams } from './join-pool.handler';

initBalancerWithDefaultMocks();

const gasPriceServiceMock: DeepMockProxy<GasPriceService> =
  mockDeep<GasPriceService>();

async function mountGeneralizedJoinHandler(pool: Pool) {
  return new GeneralisedJoinHandler(
    ref(pool),
    getBalancer(),
    gasPriceServiceMock
  );
}

const gasLimit = 2;
const estimatedGas = BigNumber.from(gasLimit);
const joinParams = mockDeep<JoinParams>();
joinParams.signer.estimateGas.mockResolvedValue(estimatedGas);
joinParams.signer.getChainId.mockResolvedValue(5);

const transactionResponse = mockDeep<TransactionResponse>();
joinParams.signer.sendTransaction.mockResolvedValue(transactionResponse);

test('Successfully executes a generalized join transaction', async () => {
  const handler = await mountGeneralizedJoinHandler(BoostedPoolMock);
  const joinResult = await handler.join(joinParams);

  expect(joinResult).toEqual(transactionResponse);
  expect(joinParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultGeneralizedJoinResponse.encodedCall,
    to: defaultGeneralizedJoinResponse.to,
    gasLimit,
  });
});
