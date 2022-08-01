import { mount } from 'vue-composable-tester';

import usePoolCreation, { PoolSeedToken } from './usePoolCreation';

// const { updateTokenWeights, getPoolSymbol } = usePoolCreation();

const tokens: Record<string, PoolSeedToken> = {};

jest.mock('vue-i18n');
jest.mock('@/locales');
jest.mock('@/composables/useTokens');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/balancer/balancer.service');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/composables/queries/usePoolsQuery');
jest.mock('@/composables/useEthers');

describe('usePoolCreation', () => {
  const { result: poolCreation } = mount(() => usePoolCreation());
  const { updateTokenWeights, getPoolSymbol, getScaledAmounts } = poolCreation;

  beforeEach(() => {
    tokens.MKR = {
      tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      weight: 70,
      isLocked: false,
      id: '0',
      amount: '0',
    };
    tokens.WETH = {
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      weight: 20,
      isLocked: false,
      id: '1',
      amount: '0',
    };
    tokens.USDT = {
      tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      weight: 10,
      isLocked: false,
      id: '2',
      amount: '0',
    };
    tokens.USDC = {
      tokenAddress: '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115',
      weight: 50,
      isLocked: false,
      id: '3',
      amount: '7643.537999999996',
    };
  });

  describe('calculatePoolSymbol', () => {
    it('Should work for default split', () => {
      const poolTokens = [tokens.MKR, tokens.WETH, tokens.USDT];
      updateTokenWeights(poolTokens);
      const symbol = getPoolSymbol();
      expect(symbol).toEqual('70MKR-20WETH-10USDT');
    });

    it('Should look good for 33-33-33 split', () => {
      tokens.MKR.weight = 33.33;
      tokens.WETH.weight = 33.33;
      tokens.USDT.weight = 33.33;

      updateTokenWeights([tokens.MKR, tokens.WETH, tokens.USDT]);

      const symbol = getPoolSymbol();
      expect(symbol).toEqual('33MKR-33WETH-33USDT');
    });

    it('Should make 66-33 split 67-33', () => {
      tokens.MKR.weight = 66.66;
      tokens.WETH.weight = 33.33;

      updateTokenWeights([tokens.MKR, tokens.WETH]);
      const symbol = getPoolSymbol();
      expect(symbol).toEqual('67MKR-33WETH');
    });

    it('Should fail if there is no symbol', () => {
      const poolTokens = [];
      updateTokenWeights(poolTokens);

      const symbol = getPoolSymbol();
      expect(symbol).toEqual('');
    });
  });

  describe('getScaledAmounts', () => {
    it('Should not return any amounts with decimals', () => {
      updateTokenWeights([tokens.USDC]);
      const scaledAmounts = getScaledAmounts();
      expect(scaledAmounts[0]).toEqual('7643537999');
    });
  });
});
