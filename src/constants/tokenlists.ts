export interface TokenListMap {
  Balancer: {
    Default: string;
    Vetted: string;
  };
  External: string[];
}

interface TokenListMapByNetwork {
  [networkKey: string]: TokenListMap;
}

/**
 * Mapping of the TokenLists used on each network
 */
export const TOKEN_LIST_MAP: TokenListMapByNetwork = {
  '1': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/vetted.tokenlist.json'
    },
    External: [
      'ipns://tokens.uniswap.org',
      'https://www.gemini.com/uniswap/manifest.json'
    ]
  },
  '5': {
    Balancer: {
      Default:
        'https://gist.githubusercontent.com/mikemcdonald/794254c72d3ce21c3beb6264bb18027f/raw/39471773dabfc908a7fbadd4991ca945dac2b677/goerli.listed.tokenlist.json',
      Vetted:
        'https://gist.githubusercontent.com/mikemcdonald/4cff1b973bfb74b13e244a8ba926ad79/raw/e01b90546b1021dace1f6edac11a0de7d25f3a2c/goerli.vetted.tokenlist.json'
    },
    External: []
  },
  '42': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/kovan.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/kovan.vetted.tokenlist.json'
    },
    External: [
      'ipns://tokens.uniswap.org',
      'https://umaproject.org/uma.tokenlist.json'
    ]
  },
  '137': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.vetted.tokenlist.json'
    },
    External: [
      'https://unpkg.com/quickswap-default-token-list@1.0.67/build/quickswap-default.tokenlist.json'
    ]
  },
  '42161': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.vetted.tokenlist.json'
    },
    External: ['https://tracer.finance/tokens']
  }
};
