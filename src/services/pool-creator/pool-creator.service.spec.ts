import BigNumber from 'bignumber.js';
import { PoolToken, poolCreator } from './pool-creator.service';

const MKR: PoolToken = {
  address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  weight: new BigNumber(0.7e18)
};
const WETH: PoolToken = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  weight: new BigNumber(0.2e18)
};
const USDT: PoolToken = {
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  weight: new BigNumber(0.1e18)
};

describe('PoolCreator', () => {

  describe('createWeightedPool', () => {


  });

  describe('sortTokens', () => {
    it ('Should sort tokens by their address', () => {
      const unsortedTokens: PoolToken[] = [
        WETH, MKR, USDT
      ];

      const sortedTokens = poolCreator.sortTokens(unsortedTokens);
      expect(sortedTokens).toEqual([MKR, WETH, USDT]);
    });
  });
});
