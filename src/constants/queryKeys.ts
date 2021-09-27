import { NetworkId } from '@/composables/useNetwork';
import { Ref } from 'vue';
export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';

const QUERY_KEYS = {
  Pools: {
    All: (
      networkId: Ref<NetworkId>,
      tokens: Ref<string[]>,
      poolIds: Ref<string[]> | undefined
    ) => [POOLS_ROOT_KEY, 'all', { networkId, tokens, poolIds }],
    User: (networkId: Ref<NetworkId>, account: Ref<string>) => [
      POOLS_ROOT_KEY,
      'user',
      { networkId, account }
    ],
    Current: (networkId: Ref<NetworkId>, id: string) => [
      POOLS_ROOT_KEY,
      'current',
      { networkId, id }
    ],
    Snapshot: (networkId: Ref<NetworkId>, id: string) => [
      POOLS_ROOT_KEY,
      'snapshot',
      { networkId, id }
    ],
    Activities: (networkId: Ref<NetworkId>, id: string) => [
      POOLS_ROOT_KEY,
      'activities',
      'all',
      { networkId, id }
    ],
    UserActivities: (
      networkId: Ref<NetworkId>,
      id: string,
      account: Ref<string>
    ) => [POOLS_ROOT_KEY, 'activities', 'user', { networkId, account, id }]
  },
  TokenLists: {
    All: (networkId: Ref<NetworkId>) => ['tokenLists', 'all', { networkId }]
  },
  Claims: {
    All: (networkId: Ref<NetworkId>, account: Ref<string>) => [
      CLAIMS_ROOT_KEY,
      { networkId, account }
    ]
  },
  Tokens: {
    Prices: (networkId: Ref<NetworkId>, tokens: Ref<string[]>) => [
      'tokens',
      'prices',
      { networkId, tokens }
    ]
  },
  Account: {
    Balances: (
      networkId: Ref<NetworkId>,
      account: Ref<string>,
      tokens: Ref<string[]>
    ) => ['account', 'balances', { networkId, account, tokens }],
    Allowances: (
      networkId: Ref<NetworkId>,
      account: Ref<string>,
      contractAddresses: Ref<string[]>,
      tokens: Ref<string[]>
    ) => [
      'account',
      'allowances',
      { networkId, account, contractAddresses, tokens }
    ],
    RelayerApprovals: (
      networkId: Ref<NetworkId>,
      account: Ref<string>,
      relayer: Ref<string>
    ) => ['account', 'relayer', { networkId, account, relayer }],
    Profile: (
      networkId: Ref<NetworkId>,
      account: Ref<string>,
      chainId: Ref<number | undefined>
    ) => ['account', 'profile', { networkId, account, chainId }]
  }
};

export default QUERY_KEYS;
