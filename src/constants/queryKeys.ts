import { Network } from '@/composables/useNetwork';
import { TokenInfo } from '@/types/TokenList';
import { Ref } from 'vue';
export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';

const QUERY_KEYS = {
  Pools: {
    All: (
      networkId: Ref<Network>,
      tokens: Ref<string[]>,
      poolIds: Ref<string[]> | undefined
    ) => [POOLS_ROOT_KEY, 'all', { networkId, tokens, poolIds }],
    User: (networkId: Ref<Network>, account: Ref<string>) => [
      POOLS_ROOT_KEY,
      'user',
      { networkId, account }
    ],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', { id }],
    Snapshot: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'snapshot',
      { networkId, id }
    ],
    Activities: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'activities',
      'all',
      { networkId, id }
    ],
    UserActivities: (
      networkId: Ref<Network>,
      id: string,
      account: Ref<string>
    ) => [POOLS_ROOT_KEY, 'activities', 'user', { networkId, account, id }],
    Swaps: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'swaps',
      { networkId, id }
    ]
  },
  TokenLists: {
    All: (networkId: Ref<Network>) => ['tokenLists', 'all', { networkId }]
  },
  Claims: {
    All: (networkId: Ref<Network>, account: Ref<string>) => [
      CLAIMS_ROOT_KEY,
      { networkId, account }
    ]
  },
  Tokens: {
    TrendingPairs: (userNetworkId: Ref<number>) => [
      'trendingTradePairs',
      { userNetworkId }
    ],
    PairPriceData: (
      tokenInAddress: Ref<string>,
      tokenOutAddress: Ref<string>,
      activeTimespan: Ref<{ option: string; value: number }>,
      userNetworkId: Ref<number>,
      nativeAsset: TokenInfo,
      wrappedNativeAsset: Ref<TokenInfo>
    ) => [
      'pairPriceData',
      {
        tokenInAddress,
        tokenOutAddress,
        activeTimespan,
        userNetworkId,
        nativeAsset,
        wrappedNativeAsset
      }
    ],
    Prices: (networkId: Ref<Network>, tokens: Ref<string[]>) => [
      'tokens',
      'prices',
      { networkId, tokens }
    ]
  },
  Account: {
    Balances: (
      networkId: Ref<Network>,
      account: Ref<string>,
      tokens: Ref<string[]>
    ) => ['account', 'balances', { networkId, account, tokens }],
    Allowances: (
      networkId: Ref<Network>,
      account: Ref<string>,
      contractAddresses: Ref<string[]>,
      tokens: Ref<string[]>
    ) => [
      'account',
      'allowances',
      { networkId, account, contractAddresses, tokens }
    ],
    RelayerApprovals: (
      networkId: Ref<Network>,
      account: Ref<string>,
      relayer: Ref<string>
    ) => ['account', 'relayer', { networkId, account, relayer }],
    Profile: (
      networkId: Ref<Network>,
      account: Ref<string>,
      chainId: Ref<number | undefined>
    ) => ['account', 'profile', { networkId, account, chainId }]
  }
};

export default QUERY_KEYS;
