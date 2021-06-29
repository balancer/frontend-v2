import useConfig from '@/composables/useConfig';

const { env, networkConfig } = useConfig();

// TODO replace imports of ETHER throughout the app so we can remove it from here.
// It doesn't make sense to have this ETHER definition here, this file should be for tokenlist URIs only.
export const ETHER = networkConfig.nativeAsset;

type TokenListConfig = {
  Balancer: {
    Default: string;
    Vetted: string;
  };
  External: string[];
};

// Mapping of the TokenLists used on each network
const TOKEN_LISTS_MAP: Record<string, TokenListConfig> = {
  '1': {
    Balancer: {
      Default:
        'https://storageapi.fleek.co/balancer-team-bucket/assets/listed.tokenlist.json',
      Vetted:
        'https://storageapi.fleek.co/balancer-team-bucket/assets/vetted.tokenlist.json'
    },
    External: [
      'ipns://tokens.uniswap.org',
      'tokenlist.zerion.eth',
      'tokens.1inch.eth',
      'tokenlist.aave.eth',
      'https://tokens.coingecko.com/uniswap/all.json',
      'https://umaproject.org/uma.tokenlist.json'
    ]
  },
  '42': {
    Balancer: {
      Default:
        'https://storageapi.fleek.co/balancer-team-bucket/assets/listed.tokenlist.json',
      Vetted:
        'https://storageapi.fleek.co/balancer-team-bucket/assets/vetted.tokenlist.json'
    },
    External: [
      'ipns://tokens.uniswap.org',
      'tokenlist.zerion.eth',
      'tokens.1inch.eth',
      'tokenlist.aave.eth',
      'https://tokens.coingecko.com/uniswap/all.json',
      'https://umaproject.org/uma.tokenlist.json'
    ]
  },
  '137': {
    Balancer: {
      Default:
        'https://storageapi.fleek.co/tomafrench-team-bucket/polygon.listed.tokenlist.json',
      Vetted:
        'https://storageapi.fleek.co/tomafrench-team-bucket/polygon.vetted.tokenlist.json'
    },
    External: [
      'https://unpkg.com/quickswap-default-token-list@1.0.67/build/quickswap-default.tokenlist.json'
    ]
  }
};

type TokenLists = {
  All: string[];
  Balancer: {
    All: string[];
    // Compliant list for exchange
    Default: string;
    // Extended list to include LBP tokens
    Vetted: string;
  };
  Approved: string[];
  External: string[];
};

/**
 * Convert TokenList config into a more usable structure
 */
const processTokenLists = (config: TokenListConfig): TokenLists => {
  const { Balancer, External } = config;

  const balancerLists = [Balancer.Default, Balancer.Vetted];
  const All = [...balancerLists, ...External];
  const Approved = [Balancer.Default, ...External];

  return {
    All,
    Balancer: {
      All: balancerLists,
      ...Balancer
    },
    Approved,
    External
  };
};

const TOKEN_LISTS = processTokenLists(TOKEN_LISTS_MAP[env.NETWORK]);

export default TOKEN_LISTS;
