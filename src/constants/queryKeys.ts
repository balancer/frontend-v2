import { Ref } from 'vue';
export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';

const QUERY_KEYS = {
  Pools: {
    All: (tokens: Ref<string[]>, poolIds: Ref<string[]> | undefined) => [
      POOLS_ROOT_KEY,
      'all',
      { tokens, poolIds }
    ],
    User: (account: Ref<string>) => [POOLS_ROOT_KEY, 'user', { account }],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', { id }],
    Snapshot: (id: string) => [POOLS_ROOT_KEY, 'snapshot', { id }],
    Activities: (id: string) => [POOLS_ROOT_KEY, 'activities', 'all', { id }],
    UserActivities: (id: string, account: Ref<string>) => [
      POOLS_ROOT_KEY,
      'activities',
      'user',
      { account, id }
    ]
  },
  TokenLists: {
    All: ['tokenLists', 'all']
  },
  Claims: {
    All: (account: Ref<string>) => [CLAIMS_ROOT_KEY, { account }]
  },
  Tokens: {
    Prices: (tokens: Ref<string[]>) => ['tokens', 'prices', { tokens }]
  },
  Account: {
    Balances: (account: Ref<string>, tokens: Ref<string[]>) => [
      'account',
      'balances',
      { account, tokens }
    ],
    Allowances: (
      account: Ref<string>,
      contractAddresses: Ref<string[]>,
      tokens: Ref<string[]>
    ) => ['account', 'allowances', { account, contractAddresses, tokens }],
    RelayerApprovals: (account: Ref<string>, relayer: Ref<string>) => [
      'account',
      'relayer',
      { account, relayer }
    ],
    Profile: (account: Ref<string>, chainId: Ref<number | undefined>) => [
      'account',
      'profile',
      { account, chainId }
    ]
  },
  App: {
    Chains: ['evm_chains']
  }
};

export default QUERY_KEYS;
