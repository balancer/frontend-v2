import { Ref } from 'vue';

const QUERY_KEYS = {
  Pools: {
    Data: (selectedTokens: Ref<string[]>, networkId: number) => [
      'pools',
      'data',
      { selectedTokens },
      networkId
    ]
  }
};

export default QUERY_KEYS;
