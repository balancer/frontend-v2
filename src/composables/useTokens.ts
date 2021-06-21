import { OgTokenMap } from '@/types';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default function useTokens() {
  const store = useStore();
  const allTokens = computed<OgTokenMap>(() =>
    store.getters['registry/getTokens']()
  );
  const allTokensIncludeEth = computed<OgTokenMap>(() =>
    store.getters['registry/getTokens']({ includeEther: true })
  );

  return { allTokens, allTokensIncludeEth };
}
