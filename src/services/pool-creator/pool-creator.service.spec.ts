import BigNumber from 'bignumber.js';
import { PoolInitToken, poolCreator } from './pool-creator.service';

const tokens: Record<string, PoolInitToken> = {};

describe('PoolCreator', () => {
  beforeEach(() => {
    tokens.MKR = {
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      symbol: 'MKR',
      weight: new BigNumber(0.7e18)
    };
    tokens.WETH = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      symbol: 'WETH',
      weight: new BigNumber(0.2e18)
    };
    tokens.USDT = {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      symbol: 'USDT',
      weight: new BigNumber(0.1e18)
    };
  });

  describe('createWeightedPool', () => {});

  describe('sortTokens', () => {
    it('Should sort tokens by their address', () => {
      const unsortedTokens: PoolInitToken[] = [
        tokens.WETH,
        tokens.MKR,
        tokens.USDT
      ];

      const sortedTokens = poolCreator.sortTokens(unsortedTokens);
      expect(sortedTokens).toEqual([tokens.MKR, tokens.WETH, tokens.USDT]);
    });
  });

  describe('calculatePoolSymbol', () => {
    it('Should work for default split', () => {
      const poolTokens = [tokens.MKR, tokens.WETH, tokens.USDT];
      const symbol = poolCreator.calculatePoolSymbol(poolTokens);
      expect(symbol).toEqual('70MKR-20WETH-10USDT');
    });

    it('Should look good for 33-33-33 split', () => {
      tokens.MKR.weight = new BigNumber(0.3333e18);
      tokens.WETH.weight = new BigNumber(0.3333e18);
      tokens.USDT.weight = new BigNumber(0.3333e18);

      const symbol = poolCreator.calculatePoolSymbol([
        tokens.MKR,
        tokens.WETH,
        tokens.USDT
      ]);
      expect(symbol).toEqual('33MKR-33WETH-33USDT');
    });

    it('Should make 66-33 split 67-33', () => {
      tokens.MKR.weight = new BigNumber(0.6666e18);
      tokens.WETH.weight = new BigNumber(0.3333e18);

      const symbol = poolCreator.calculatePoolSymbol([tokens.MKR, tokens.WETH]);
      expect(symbol).toEqual('67MKR-33WETH');
    });
  });
});
