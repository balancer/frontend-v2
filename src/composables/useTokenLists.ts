import { computed, reactive, ref, watch } from 'vue';
import { TOKEN_LISTS } from '@/constants/tokenlists';
import { useQuery } from 'vue-query';
import { loadTokenlist } from '@/utils/tokenlists';
import { useStore } from 'vuex';
import { flatten, keyBy } from 'lodash';

const loadAllTokenLists = async () => {
  // since a request to retrieve the list can fail
  // it is best to use allSettled as we still want to
  // retrieve what we can
  return (
    await Promise.allSettled(
      TOKEN_LISTS.map(async listName => await loadTokenlist(listName))
    )
  )
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value);
};

export default function useTokenLists() {
  const store = useStore();
  const activeTokenLists = ref<string[]>([]);

  const { data: lists, isLoading } = useQuery(
    reactive(['tokenLists']),
    loadAllTokenLists
  );

  const listNameMap = computed(() => keyBy(lists.value, 'name'));
  const injectedTokens = store.getters['registry/getInjected'];
  const tokens = computed(() => {
    return [
      ...Object.values(injectedTokens),
      ...flatten(
        activeTokenLists.value.map(name => listNameMap.value[name].tokens)
      ).filter(
        token => token.chainId === Number(process.env.VUE_APP_NETWORK || 1)
      )
    ];
  });

  const toggleActiveTokenList = (name: string) => {
    console.log('DEBUG: BINGPOT', name);
    // remove from active lists
    if (activeTokenLists.value.includes(name)) {
      activeTokenLists.value = activeTokenLists.value.filter(
        listName => listName !== name
      );
      return;
    }
    activeTokenLists.value = [...activeTokenLists.value, name];
  };

  const isActiveList = (name: string) => {
    return activeTokenLists.value.includes(name);
  };

  watch(activeTokenLists, () => console.log('DEBUG: active', tokens));

  return {
    isLoading,
    lists,
    toggleActiveTokenList,
    isActiveList
  };
}
