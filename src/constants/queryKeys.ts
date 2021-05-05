import { Ref } from 'vue';

export const POOLS_ROOT_KEY = 'pools';

const QUERY_KEYS = {
  Pools: {
    All: [POOLS_ROOT_KEY, 'all'],
    Shares: (account: Ref<string>) => [POOLS_ROOT_KEY, 'shares', account],
    Activities: (id: string) => [POOLS_ROOT_KEY, 'activities', 'all', id],
    UserActivities: (id: string, account: Ref<string>) => [
      POOLS_ROOT_KEY,
      'activities',
      account,
      id
    ]
  }
};

export default QUERY_KEYS;
