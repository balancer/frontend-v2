import { Ref } from 'vue';

const QUERY_KEYS = {
  Pools: {
    All: ['pools', 'all'],
    Shares: (account: Ref<string>) => ['pools', 'shares', account],
    Current: (id: string) => ['pools', 'current', id]
  }
};

export default QUERY_KEYS;
