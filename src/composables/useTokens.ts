import { computed } from 'vue';
import { useStore } from 'vuex';

export default function useTokens() {
  const store = useStore();
  const allTokens = computed(() => store.getters['registry/getTokens']());

  return { allTokens };
}
