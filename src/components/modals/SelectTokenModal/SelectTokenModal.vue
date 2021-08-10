<template>
  <BalModal show @close="$emit('close')" no-content-pad>
    <template v-slot:header>
      <div class="w-full flex justify-between items-center">
        <div class="flex items-center">
          <BalBtn
            v-if="selectTokenList"
            color="gray"
            size="xs"
            class="mr-2"
            flat
            circle
            @click="onListExit"
          >
            <BalIcon name="arrow-left" size="sm" />
          </BalBtn>
          <h5>{{ title }}</h5>
        </div>
        <div
          v-if="!selectTokenList"
          @click="toggleSelectTokenList"
          class="flex items-center group cursor-pointer"
        >
          <span class="text-xs text-gray-500">{{ $t('tokenLists') }}</span>
          <div class="flex items-center ml-2">
            <span class="mr-1 ">
              <img
                v-for="(tokenlist, i) in activeTokenLists"
                :key="i"
                :src="resolve(tokenlist.logoURI)"
                class="rounded-full inline-block bg-white shadow w-6 h-6"
              />
            </span>
            <BalIcon
              name="chevron-down"
              size="sm"
              class="ml-1 text-blue-500 group-hover:text-pink-500 group-focus:text-pink-500 transition-all duration-200 ease-out "
            />
          </div>
        </div>
      </div>
    </template>
    <template v-if="selectTokenList">
      <Search
        v-model="query"
        :placeholder="$t('searchByName')"
        class="px-4 py-3 flex-auto border-b dark:border-gray-700"
      />
      <div>
        <div
          v-if="Object.keys(tokenLists).length > 0"
          class="h-96 overflow-y-scroll"
        >
          <TokenListsListItem
            v-for="(tokenList, uri) in tokenLists"
            :key="uri"
            :isActive="isActiveList(uri)"
            :tokenlist="tokenList"
            :uri="uri"
            @toggle="onToggleList(uri)"
          />
        </div>
        <div
          v-else
          v-text="$t('errorNoLists')"
          class="h-96 flex items-center justify-center"
        />
      </div>
    </template>
    <template v-else>
      <div class="border-b dark:border-gray-700 flex">
        <Search
          v-model="query"
          :placeholder="$t('searchBy')"
          class="px-4 py-3 flex-auto"
        />
      </div>
      <div class="overflow-hidden rounded-lg">
        <RecycleScroller
          class="h-96 overflow-y-scroll"
          v-if="tokens.length > 0"
          :items="tokens"
          :item-size="64"
          key-field="address"
          v-slot="{ item: token }"
          :buffer="100"
        >
          <a @click="onSelectToken(token.address)">
            <TokenListItem
              :token="token"
              :balanceLoading="dynamicDataLoading"
            />
          </a>
        </RecycleScroller>
        <div v-else-if="loading" class="h-96 flex items-center justify-center">
          <BalLoadingIcon />
        </div>
        <div
          v-else
          v-text="$t('errorNoTokens')"
          class="h-96 p-12 text-center text-gray-500"
        />
      </div>
    </template>
  </BalModal>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  PropType,
  watch,
  toRef
} from 'vue';
import { useI18n } from 'vue-i18n';
import useTokenLists from '@/composables/useTokenLists';
import TokenListItem from '@/components/lists/TokenListItem.vue';
import TokenListsListItem from '@/components/lists/TokenListsListItem.vue';
import Search from './Search.vue';
import useTokens from '@/composables/useTokens';
import { orderBy } from 'lodash';
import useUrls from '@/composables/useUrls';
import { TokenInfoMap } from '@/types/TokenList';

interface ComponentState {
  loading: boolean;
  selectTokenList: boolean;
  query: string;
  results: TokenInfoMap;
}

export default defineComponent({
  components: {
    TokenListItem,
    TokenListsListItem,
    Search
  },

  emits: ['close', 'selectTokenlist', 'select'],

  props: {
    open: { type: Boolean, default: false },
    excludedTokens: { type: Array as PropType<string[]>, default: () => [] },
    includeEther: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    /**
     * STATE
     */
    const state: ComponentState = reactive({
      loading: false,
      selectTokenList: false,
      query: '',
      results: {}
    });

    /**
     * COMPOSABLES
     */
    const {
      activeTokenLists,
      approvedTokenLists,
      toggleTokenList,
      isActiveList
    } = useTokenLists();
    const {
      searchTokens,
      priceFor,
      balanceFor,
      dynamicDataLoading,
      nativeAsset
    } = useTokens();
    const { t } = useI18n();
    const { resolve } = useUrls();

    /**
     * COMPUTED
     */
    const title = computed(() => {
      if (state.selectTokenList) return t('manageLists');
      return t('selectToken');
    });

    const tokenLists = computed(() => {
      const query = state.query.toLowerCase();
      const tokenListArray = Object.entries(approvedTokenLists.value);
      const results = tokenListArray.filter(([, tokenList]) =>
        tokenList.name.toLowerCase().includes(query)
      );
      return Object.fromEntries(results);
    });

    const tokens = computed(() => {
      const tokensWithValues = Object.values(state.results).map(token => {
        const balance = balanceFor(token.address);
        const price = priceFor(token.address);
        const value = Number(balance) * price;
        return {
          ...token,
          price,
          balance,
          value
        };
      });

      return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc']);
    });

    const excludedTokens = computed(() => [
      ...props.excludedTokens,
      ...(props.includeEther ? [] : [nativeAsset.address])
    ]);

    /**
     * METHODS
     */
    function onSelectToken(token: string): void {
      emit('select', token);
      emit('close');
    }

    async function onToggleList(uri: string): Promise<void> {
      toggleTokenList(uri);
      state.results = await searchTokens(state.query, excludedTokens.value);
    }

    function onListExit(): void {
      state.selectTokenList = false;
      state.query = '';
    }

    function toggleSelectTokenList(): void {
      state.selectTokenList = !state.selectTokenList;
      state.query = '';
    }

    /**
     * WATCHERS
     */
    watch(
      toRef(state, 'query'),
      async newQuery => {
        state.results = await searchTokens(newQuery, excludedTokens.value);
      },
      { immediate: true }
    );

    return {
      // data
      ...toRefs(state),
      // computed
      title,
      tokens,
      tokenLists,
      activeTokenLists,
      dynamicDataLoading,
      // methods
      onSelectToken,
      onToggleList,
      onListExit,
      toggleSelectTokenList,
      isActiveList,
      resolve
    };
  }
});
</script>
