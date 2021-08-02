import { Config } from '@/lib/config';
import { TokenMap } from '@/types';
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
  Balances: {
    All: (
      account: Ref<string>,
      userNetwork: Ref<unknown>,
      tokens?: Ref<TokenMap>
    ) => [BALANCES_ROOT_KEY, { userNetwork, account, tokens }]
  },
  TokenLists: ['tokenLists'],
  Claims: {
    All: (account: Ref<string>) => [CLAIMS_ROOT_KEY, { account }]
  },
  Tokens: {
    Prices: (tokens: Ref<string[]>) => ['tokens', 'prices', { tokens }]
  },
  Account: {
    Balances: (
      account: Ref<string>,
      networkKey: Ref<string>,
      tokens: Ref<string[]>
    ) => ['account', 'balances', { account, networkKey, tokens }],
    Allowances: (
      userNetwork: Ref<Config>,
      account: Ref<string>,
      dstList: Ref<string[]>,
      tokens: Ref<string[]>
    ) => ['account', 'allowances', { userNetwork, account, dstList, tokens }],
    Profile: (account: Ref<string>, userNetwork: Ref<Config>) => [
      'account',
      'profile',
      { account, userNetwork }
    ]
  },
  App: {
    Chains: ['evm_chains']
  }
};

export default QUERY_KEYS;
