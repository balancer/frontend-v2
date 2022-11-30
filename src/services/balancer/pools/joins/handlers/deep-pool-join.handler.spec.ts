import { DeepPoolJoinHandler } from './deep-pool-join.handler';
import { formatFixed } from '@ethersproject/bignumber';
import pool from './__tests__/pool';
import { bnum } from '@/lib/utils';
import { balancer } from '@/lib/balancer.sdk';
import { txResponseMock } from '@/__mocks__/transactions';
import mockSigner from './__tests__/mockSigner';

const expectedOut = '990000000000000000';
const expectedOutScaled = formatFixed(expectedOut, pool.onchain?.decimals);
const priceImpact = '23149074398013786';
const scaledPriceImpact = bnum(formatFixed(priceImpact, 18)).toNumber();
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
    balancer: {
      pools: {
        generalisedJoin: jest.fn().mockResolvedValue({
          callData: '0xac9650d800000000000',
          expectedOut,
          minOut: '5000000000',
          priceImpact,
          to: '0x28A224d9d398a1eBB7BA69BCA515898966Bb1B6b',
        }),
      },
    },
  };
});

describe('DeepPoolJoinHandler', () => {
  it('should do deep queryJoin', async () => {
    const deepPoolJoinHandler = new DeepPoolJoinHandler(
      pool,
      balancer,
      {} as any
    );
    const res = await deepPoolJoinHandler.queryJoin(joinParams);

    expect(res).toEqual({
      bptOut: expectedOutScaled,
      priceImpact: scaledPriceImpact,
    });
  });

  it('should return transaction from deep pool join', async () => {
    const deepPoolJoinHandler = new DeepPoolJoinHandler(
      pool,
      balancer,
      {} as any
    );
    const res = await deepPoolJoinHandler.join(joinParams);

    expect(res).toEqual(txResponseMock);
  });
});
