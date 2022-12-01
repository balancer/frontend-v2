import { SwapJoinHandler } from './swap-join.handler';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import pool from './__tests__/pool';
import { balancer } from '@/lib/balancer.sdk';
import { txResponseMock } from '@/__mocks__/transactions';
import mockSigner from './__tests__/mockSigner';
import mockGasPriceService from './__tests__/mockGasPriceService';

const returnAmountHex = '0x013fbe85edc90000';
const marketSp = '1.000';
const returnAmount = BigNumber.from(returnAmountHex);
const returnAmountScaled = formatFixed(returnAmount, pool.onchain?.decimals);
const priceImpact = 10.11111111111111;
const joinParams = {
  prices: { '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { fiat: 1 } },
  amountsIn: [
    {
      address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      value: '1',
      valid: true,
    },
  ],
  tokensIn: {
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': {
      decimals: 18,
      address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      chainId: 5,
      name: 'Mock',
      symbol: 'MCK',
    },
  },
  signer: mockSigner,
  slippageBsp: 100,
};
jest.mock('@/services/web3/web3.service.ts');

jest.mock('@/lib/balancer.sdk.ts', () => {
  return {
    network: 5,
    hasFetchedPoolsForSor: true,
    fetchPoolsForSor: jest.fn().mockResolvedValue(true),
    balancer: {
      swaps: {
        findRouteGivenIn: jest.fn().mockResolvedValue({
          marketSp,
          returnAmount: returnAmountHex,
        }),
        buildSwap: jest.fn().mockReturnValue({
          attributes: {
            kind: 0,
            swaps: [
              {
                poolId:
                  '0xf461f2240b66d55dcf9059e26c022160c06863bf000100000000000000000006',
                assetInIndex: 0,
                assetOutIndex: 1,
                amount: '1000000000000000000',
                userData: '0x',
                returnAmount: '923095125300417707',
              },
              {
                poolId:
                  '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e',
                assetInIndex: 1,
                assetOutIndex: 2,
                amount: '0',
                userData: '0x',
                returnAmount: '912865457726303983',
              },
            ],
            assets: [
              '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
              '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
              '0x48e6b98ef6329f8f0a30ebb8c7c960330d648085',
            ],
            funds: {
              sender: '0x8fE3a2A5ae6BaA201C26fC7830EB713F33d6b313',
              recipient: '0x8fE3a2A5ae6BaA201C26fC7830EB713F33d6b313',
              fromInternalBalance: false,
              toInternalBalance: false,
            },
            limits: ['1000000000000000000', '0', '-821578911953673584'],
          },
        }),
      },
    },
  };
});

describe('SwapJoinHandler', () => {
  it('should do swap queryJoin', async () => {
    const swapJoinHandler = new SwapJoinHandler(
      pool,
      balancer,
      mockGasPriceService
    );
    const res = await swapJoinHandler.queryJoin(joinParams);

    expect(res).toEqual({
      bptOut: returnAmountScaled,
      priceImpact,
    });
  });

  it('should return transaction from deep pool join', async () => {
    const swapJoinHandler = new SwapJoinHandler(
      pool,
      balancer,
      mockGasPriceService
    );
    const res = await swapJoinHandler.join(joinParams);

    expect(res).toEqual(txResponseMock);
  });
});
