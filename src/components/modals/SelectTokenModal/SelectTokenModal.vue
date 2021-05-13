<template>
  <BalModal :show="open" @close="onClose" no-content-pad>
    <template v-slot:header>
      <BalBtn
        v-if="selectTokenList"
        color="gray"
        size="sm"
        class="mr-2"
        flat
        circle
        @click="onListExit"
      >
        <BalIcon name="arrow-left" size="sm" />
      </BalBtn>
      <h3>{{ title }}</h3>
    </template>
    <template v-if="selectTokenList">
      <Search
        v-model="query"
        :placeholder="t('searchByName')"
        class="p-4 border-b dark:border-gray-700"
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
          class="p-4 flex-auto"
        />
        <a @click="toggleSelectTokenList" class="p-4 flex">
          <span class="mr-1">
            <img
              v-for="(tokenlist, i) in activeTokenLists"
              :key="`activeTokenListIcon-${i}`"
              :src="_url(listDictionary[tokenlist]?.logoURI)"
              class="rounded-full inline-block bg-white align-middle shadow w-6 h-6"
            />
          </span>
          <BalIcon name="chevron-down" class="text-gray-500" />
        </a>
      </div>
      <div>
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
        <div
          v-else
          v-text="t('errorNoTokens')"
          class="h-96 flex items-center justify-center"
        />
      </div>
    </template>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { clone } from '@/utils';
import { isAddress, getAddress } from '@ethersproject/address';
import useTokenLists from '@/composables/useTokenLists';
import TokenListItem from '@/components/lists/TokenListItem.vue';
import TokenListsListItem from '@/components/lists/TokenListsListItem.vue';
import Search from './Search.vue';

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
      tokens,
      listDictionary,
      activeTokenLists
    } = useTokenLists(data);

    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();

    // COMPUTED
    const title = computed(() => {
      if (data.selectTokenList) return t('manageLists');
      return t('selectToken');
    });

    const tokenlistsReverse = computed(() => {
      const tokenListsClone = clone(tokenLists.value);
      return Object.values(tokenListsClone).reverse();
    });

    // METHODS
    function onTokenSearch(event): void {
      let address = event.target.value;
      if (isAddress(address)) {
        address = getAddress(address);
        data.queryAddress = address;
        if (props.excludedTokens.includes(address)) data.isTokenSelected = true;
        else {
          data.isTokenSelected = false;
          store.dispatch('registry/injectTokens', [address.trim()]);
        }
      } else {
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

    function onClose() {
      data.selectTokenList = false;
      data.query = '';
      emit('close');
    }

    return {
      // data
      ...toRefs(data),
      t,
      // computed
      title,
      tokens,
      tokenlistsReverse,
      tokenLists,
      listDictionary,
      activeTokenLists,

      // methods
      onTokenSearch,
      onSelectToken,
      onSelectList,
      onListExit,
      toggleSelectTokenList,
      onClose,

      toggleActiveTokenList,
      isActiveList,
      console
    };
  }
});
</script>
