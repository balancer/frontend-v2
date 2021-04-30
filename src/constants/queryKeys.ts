import { Ref } from 'vue';

const QUERY_KEYS = {
  Pools: {
    All: ['pools', 'all'],
    Shares: (account: Ref<string>) => ['pools', 'shares', account]
  }
};

export default QUERY_KEYS;
