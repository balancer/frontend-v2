export default function useTokens() {
  return {
    injectTokens: vi.fn(),
    priceFor: vi.fn(),
    hasBalance: vi.fn().mockReturnValue(false),
    balanceFor: vi.fn().mockReturnValue('0'),
    getToken: vi.fn().mockImplementation(address => {
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
      };
      return mockTokens[address];
    }),
  };
}
