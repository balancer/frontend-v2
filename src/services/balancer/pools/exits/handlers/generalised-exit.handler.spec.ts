import { getBalancer } from '@/dependencies/balancer-sdk';
import {
  defaultGeneralizedExitResponse,
  initBalancerWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { ref } from 'vue';
import { ExitParams } from './exit-pool.handler';
import { GeneralisedExitHandler } from './generalised-exit.handler';

initBalancerWithDefaultMocks();

const gasPriceServiceMock: DeepMockProxy<GasPriceService> =
  mockDeep<GasPriceService>();

async function mountGeneralizedExitHandler(pool: Pool) {
  return new GeneralisedExitHandler(
    ref(pool),
    getBalancer(),
    gasPriceServiceMock
  );
}

const gasLimit = 2;
const estimatedGas = BigNumber.from(gasLimit);
const exitParams = mockDeep<ExitParams>();
exitParams.bptIn = '1';
exitParams.signer.estimateGas.mockResolvedValue(estimatedGas);
exitParams.signer.getChainId.mockResolvedValue(5);

const transactionResponse = mockDeep<TransactionResponse>();
exitParams.signer.sendTransaction.mockResolvedValue(transactionResponse);

test('Successfully executes a generalized exit transaction', async () => {
  const handler = await mountGeneralizedExitHandler(BoostedPoolMock);
  const joinResult = await handler.exit(exitParams);

  expect(joinResult).toEqual(transactionResponse);
  expect(exitParams.signer.sendTransaction).toHaveBeenCalledOnceWith({
    data: defaultGeneralizedExitResponse.encodedCall,
    to: defaultGeneralizedExitResponse.to,
    gasLimit,
  });
});
