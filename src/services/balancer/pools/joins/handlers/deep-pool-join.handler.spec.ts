import { DeepPoolJoinHandler } from './deep-pool-join.handler';
import useWeb3Mock from '@/services/web3/__mocks__/useWeb3';
import { formatFixed } from '@ethersproject/bignumber';
import pool from './__tests__/pool';
import { bnum } from '@/lib/utils';
import { balancer } from '@/lib/balancer.sdk';

const expectedOut = '990000000000000000';
const expectedOutScaled = formatFixed(expectedOut, pool.onchain.decimals);
const priceImpact = '23149074398013786';
const scaledPriceImpact = bnum(formatFixed(priceImpact, 18)).toNumber();

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
      // @ts-ignore-next-line -- Pool type fields from SDK are wrong?
      pool,
      balancer,
      undefined
    );
    const res = await deepPoolJoinHandler.queryJoin({
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
      signer: useWeb3Mock().getSigner(),
      slippageBsp: 100,
    });

    expect(res).toEqual({
      bptOut: expectedOutScaled,
      priceImpact: scaledPriceImpact,
    });
  });
});
