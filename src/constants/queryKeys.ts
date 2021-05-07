import { Ref } from 'vue';

export const POOLS_ROOT_KEY = 'pools';

const QUERY_KEYS = {
  Pools: {
    All: (tokens: Ref<string[]>) => [POOLS_ROOT_KEY, 'all', { tokens }],
    User: (account: Ref<string>) => [POOLS_ROOT_KEY, 'user', { account }],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', { id }]
  }
};

export default QUERY_KEYS;
