import { SwapJoinHandler } from './swap-join.handler';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import pool from './__tests__/pool';
import { balancer } from '@/lib/balancer.sdk';
import mockSigner from './__tests__/mockSigner';

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
      },
    },
  };
});

describe('SwapJoinHandler', () => {
  it('should do swap queryJoin', async () => {
    const swapJoinHandler = new SwapJoinHandler(pool, balancer, {
      getGasPrice: jest.fn().mockResolvedValue({ price: '1' }),
    } as any);
    const res = await swapJoinHandler.queryJoin(joinParams);

    expect(res).toEqual({
      bptOut: returnAmountScaled,
      priceImpact,
    });
  });
});
