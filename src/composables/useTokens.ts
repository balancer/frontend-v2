import { TokenMap } from '@/types';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default function useTokens() {
  const store = useStore();
  const allTokens = computed<TokenMap>(() =>
    store.getters['registry/getTokens']()
  );
  const allTokensIncludeEth = computed<TokenMap>(() =>
    store.getters['registry/getTokens']({ includeEther: true })
  );

  return { allTokens, allTokensIncludeEth };
}
