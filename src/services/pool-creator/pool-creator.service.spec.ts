import { TokenWeight } from '@/composables/pools/usePoolCreation';
import { poolCreator } from './pool-creator.service';
import BigNumber from 'bignumber.js';

const tokens: Record<string, TokenWeight> = {};

jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('PoolCreator', () => {
  beforeEach(() => {
    tokens.MKR = {
      tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      weight: 70,
      isLocked: false,
      id: 0
    };
    tokens.WETH = {
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      weight: 20,
      isLocked: false,
      id: 1
    };
    tokens.USDT = {
      tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      weight: 10,
      isLocked: false,
      id: 2
    };
  });

  // describe('createWeightedPool', () => {});

  describe('sortTokens', () => {
    it('Should sort tokens by their address', () => {
      const unsortedTokens: TokenWeight[] = [
        tokens.WETH,
        tokens.MKR,
        tokens.USDT
      ];

      const sortedTokens = poolCreator.sortTokens(unsortedTokens);
      expect(sortedTokens).toEqual([tokens.MKR, tokens.WETH, tokens.USDT]);
    });
  });

  describe('calculateTokenWeights', () => {
    it('Should return 50e16/50e16 for 2 Token happy case. ', () => {
      tokens.MKR.weight = 50;
      tokens.WETH.weight = 50;
      const normalizedWeights: string[] = poolCreator.calculateTokenWeights([
        tokens.MKR,
        tokens.WETH
      ]);
      expect(normalizedWeights[0]).toEqual(new BigNumber(0.5e18).toString());
      expect(normalizedWeights[1]).toEqual(new BigNumber(0.5e18).toString());
    });

    it('Should return weights that add up to exactly 1e18', () => {
      tokens.MKR.weight = 33.33;
      tokens.WETH.weight = 33.33;
      tokens.USDT.weight = 33.33;
      const normalizedWeights: string[] = poolCreator.calculateTokenWeights([
        tokens.MKR,
        tokens.WETH,
        tokens.USDT
      ]);
      expect(normalizedWeights[0]).toEqual('333333333333333333');
      expect(normalizedWeights[1]).toEqual('333333333333333333');
      expect(normalizedWeights[2]).toEqual('333333333333333334');
    });
  });
});
