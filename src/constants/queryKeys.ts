import { Ref } from 'vue';

export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';

const QUERY_KEYS = {
  Pools: {
    All: [POOLS_ROOT_KEY, 'all'],
    Shares: (account: Ref<string>) => [POOLS_ROOT_KEY, 'shares', account],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', id]
  },
  Balances: {
    All: (account: Ref<string>, userNetwork: Ref<unknown>) => [
      BALANCES_ROOT_KEY,
      { userNetwork, account }
    ]
  }
};

export default QUERY_KEYS;
