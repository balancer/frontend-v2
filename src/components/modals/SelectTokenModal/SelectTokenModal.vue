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
                :src="tokenListUrl(tokenlist.logoURI)"
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
          v-if="Object.keys(filteredTokenLists).length > 0"
          class="h-96 overflow-y-scroll"
        >
          <TokenListsListItem
            v-for="(tokenList, uri) in filteredTokenLists"
            :key="uri"
            :isActive="isActiveList(uri)"
            :tokenlist="tokenList"
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
          @update:modelValue="onTokenSearch"
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
        <div
          v-else-if="isTokenSelected"
          v-text="$t('tokenAlreadySelected')"
          class="h-96 flex items-center justify-center"
        />
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
  ref,
  toRefs,
  computed,
  PropType,
  onMounted,
  watch
} from 'vue';
import { useI18n } from 'vue-i18n';
import useTokenLists2 from '@/composables/useTokenLists2';
import TokenListItem from '@/components/lists/TokenListItem.vue';
import TokenListsListItem from '@/components/lists/TokenListsListItem.vue';
import Search from './Search.vue';
import useTokens2 from '@/composables/useTokens2';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { orderBy } from 'lodash';
import useUserSettings from '@/composables/useUserSettings';

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
    // DATA
    const tokens = ref<TokenInfo[]>([]);
    const selectTokenLists = ref(false);
    const data = reactive({
      loading: false,
      query: '',
      selectTokenList: false,
      isTokenSelected: false,
      includeEther: props.includeEther,
      not: props.excludedTokens,
      queryAddress: ''
    });

    const {
      activeTokenLists,
      approvedTokenLists,
      toggleTokenList,
      isActiveList,
      tokenListUrl
    } = useTokenLists2();
    const {
      allTokens,
      searchTokens,
      balances,
      prices,
      dynamicDataSuccess,
      dynamicDataLoading
    } = useTokens2();
    const { currency } = useUserSettings();

    // COMPOSABLES
    const { t } = useI18n();

    // COMPUTED
    const title = computed(() => {
      if (selectTokenLists.value) return t('manageLists');
      return t('selectToken');
    });

    const filteredTokenLists = computed(() => {
      const query = data.query.toLowerCase();
      const tokenListArray = Object.entries(approvedTokenLists.value);
      const results = tokenListArray.filter(([, tokenList]) =>
        tokenList.name.toLowerCase().includes(query)
      );
      return Object.fromEntries(results);
    });

    // METHODS
    async function onTokenSearch(query): Promise<void> {
      const results = await searchTokens(query, props.excludedTokens);
      setTokens(Object.values(results));
    }

    function onSelectToken(token: string): void {
      emit('select', token);
      emit('close');
    }

    function onToggleList(uri: string): void {
      toggleTokenList(uri);
      setTokens(Object.values(allTokens.value));
    }

    function onListExit(): void {
      data.selectTokenList = false;
      data.query = '';
    }

    function toggleSelectTokenList(): void {
      data.selectTokenList = !data.selectTokenList;
      data.query = '';
    }

    function setTokens(_tokens: TokenInfo[]): void {
      const tokensWithValues = _tokens.map(token => {
        const balance = Number(balances.value[token.address]) || 0;
        const price = prices.value[token.address]
          ? prices.value[token.address][currency.value] || 0
          : 0;
        const value = balance * price;
        return {
          ...token,
          price,
          balance,
          value
        };
      });

      tokens.value = orderBy(
        tokensWithValues,
        ['value', 'balance'],
        ['desc', 'desc']
      );
    }

    onMounted(() => {
      setTokens(Object.values(allTokens.value));
    });

    watch(dynamicDataSuccess, dataAvailable => {
      console.log('Dynamic data available?', dataAvailable);
      setTokens(tokens.value);
    });

    watch(dynamicDataLoading, isLoading => {
      console.log('Dynamic data isLoading', isLoading);
    });

    return {
      // data
      ...toRefs(data),
      // computed
      title,
      tokens,
      filteredTokenLists,
      activeTokenLists,
      dynamicDataLoading,
      // methods
      onTokenSearch,
      onSelectToken,
      onToggleList,
      onListExit,
      toggleSelectTokenList,
      isActiveList,
      tokenListUrl
    };
  }
});
</script>
