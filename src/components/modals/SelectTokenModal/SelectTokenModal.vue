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
                :key="`activeTokenListIcon-${i}`"
                :src="_url(listMap[tokenlist]?.logoURI)"
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
        :placeholder="t('searchByName')"
        class="px-4 py-3 flex-auto border-b dark:border-gray-700"
      />
      <div>
        <div
          v-if="Object.keys(tokenLists).length > 0"
          class="h-96 overflow-y-scroll"
        >
          <TokenListsListItem
            v-for="(tokenList, i) in tokenLists"
            :key="i"
            :isActive="isActiveList(tokenList.name)"
            :tokenlist="tokenList"
            @toggle="toggleActiveTokenList(tokenList.name)"
          />
        </div>
        <div
          v-else
          v-text="t('errorNoLists')"
          class="h-96 flex items-center justify-center"
        />
      </div>
    </template>
    <template v-else>
      <div class="border-b dark:border-gray-700 flex">
        <Search
          v-model="query"
          @input="onTokenSearch"
          :placeholder="t('searchBy')"
          class="px-4 py-3 flex-auto"
        />
      </div>
      <div class="overflow-hidden rounded-lg">
        <RecycleScroller
          class="h-96 overflow-y-scroll"
          v-if="tokens?.length > 0"
          :items="tokens"
          :item-size="64"
          key-field="address"
          v-slot="{ item }"
          :buffer="100"
        >
          <a @click="onSelectToken(item.address)">
            <TokenListItem :token="item" />
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
        <div v-else v-text="t('errorNoTokens')" class="h-96 p-4" />
      </div>
    </template>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { isAddress, getAddress } from '@ethersproject/address';
import useTokenLists from '@/composables/useTokensStore';
// import useTokenLists2 from '@/composables/useTokenLists2';
import TokenListItem from '@/components/lists/TokenListItem.vue';
import TokenListsListItem from '@/components/lists/TokenListsListItem.vue';
import Search from './Search.vue';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  components: {
    TokenListItem,
    TokenListsListItem,
    Search
  },

  emits: ['close', 'selectTokenlist', 'select'],

  props: {
    open: { type: Boolean, default: false },
    excludedTokens: { type: Array, default: () => [] },
    includeEther: { type: Boolean, default: false }
  },

  setup(props, { emit }) {
    // DATA
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
      lists: tokenLists,
      toggleActiveTokenList,
      isActiveList,
      listMap,
      activeTokenLists
    } = useTokenLists();
    const { tokens: tokenMap } = useTokens(data);
    const tokens = computed(() => Object.values(tokenMap.value));
    // const {
    //   approvedTokenLists,
    //   toggleList,
    //   toggled: toggledTokenLists,
    //   isToggled: isToggledList
    // } = useTokenLists2();

    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();

    // COMPUTED
    const title = computed(() => {
      if (data.selectTokenList) return t('manageLists');
      return t('selectToken');
    });

    // METHODS
    function onTokenSearch(event): void {
      let address = event.target.value;
      if (isAddress(address)) {
        address = getAddress(address);
        data.queryAddress = address;
        if (props.excludedTokens.includes(address)) {
          data.loading = false;
          data.isTokenSelected = true;
        } else {
          data.loading = true;
          data.isTokenSelected = false;
          store.dispatch('registry/injectTokens', [address.trim()]);
        }
      } else {
        data.isTokenSelected = false;
        data.loading = false;
        data.queryAddress = '';
      }
    }

    function onSelectToken(token: string): void {
      emit('select', token);
      emit('close');
    }

    function onSelectList(list: string): void {
      store.dispatch('registry/toggleList', list);
    }

    function onListExit(): void {
      data.selectTokenList = false;
      data.query = '';
    }

    function toggleSelectTokenList(): void {
      data.selectTokenList = !data.selectTokenList;
      data.query = '';
    }

    return {
      // data
      ...toRefs(data),
      t,
      // computed
      title,
      tokens,
      tokenLists,
      listMap,
      activeTokenLists,

      // methods
      onTokenSearch,
      onSelectToken,
      onSelectList,
      onListExit,
      toggleSelectTokenList,
      toggleActiveTokenList,
      isActiveList
    };
  }
});
</script>
