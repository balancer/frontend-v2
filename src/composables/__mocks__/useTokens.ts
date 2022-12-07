const mockTokens = {
  '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': {
    symbol: 'MKR',
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    symbol: 'WETH',
  },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    symbol: 'USDT',
  },
  '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115': {
    symbol: 'USDC',
    decimals: 6,
  },
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
    symbol: 'wstETH',
  },
  '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb': {
    symbol: 'bb-a-USDT',
  },
  '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83': {
    symbol: 'bb-a-USDC',
  },
  '0xae37D54Ae477268B9997d4161B96b8200755935c': {
    symbol: 'bb-a-DAI',
  },
};

export default function useTokens() {
  return {
    injectTokens: jest.fn().mockImplementation(),
    priceFor: () => 2,
    hasBalance: jest.fn().mockReturnValue(false),
    balanceFor: jest.fn().mockReturnValue('0'),
    getToken: jest.fn().mockImplementation(address => {
      return mockTokens[address];
    }),
    getTokens: jest.fn().mockImplementation(addresses => {
      return Object.fromEntries(
        addresses.map(address => {
          return [address, mockTokens[address]];
        })
      );
    }),
  };
}
