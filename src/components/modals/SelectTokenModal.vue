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
          <a
            v-for="(tokenList, i) in tokenLists"
            :key="i"
            @click="onSelectList(i)"
          >
            <RowTokenlist :tokenlist="tokenList" />
          </a>
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
              :key="i"
              :src="_url(tokenlist.logoURI)"
              class="rounded-full inline-block bg-white align-middle shadow -ml-3"
              width="26"
              height="26"
            />
          </span>
          <BalIcon name="chevron-down" class="text-gray-500" />
        </a>
      </div>
      <div>
        <div v-if="Object.keys(tokens).length > 0" class="h-96 overflow-scroll">
          <a
            v-for="(token, key) in tokens"
            :key="key"
            @click="onSelectToken(token.address)"
          >
            <RowToken :token="token" />
          </a>
        </div>
        <div
          v-else-if="isTokenSelected"
          class="h-96 flex items-center justify-center"
        >
          Token Already Selected
        </div>
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

export default defineComponent({
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
      isTokenSelected: false
    });

    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();

    // COMPUTED
    const title = computed(() => {
      if (data.selectTokenList) return t('manageLists');
      return t('selectToken');
    });

    const tokens = computed(() => {
      return store.getters['registry/getTokens']({
        q: data.query,
        not: props.excludedTokens,
        includeEther: props.includeEther
      });
    });

    const tokenLists = computed(() => {
      return store.getters['registry/getTokenLists']({ q: data.query });
    });

    const tokenlistsReverse = computed(() => {
      const tokenListsClone = clone(tokenLists.value);
      return Object.values(tokenListsClone).reverse();
    });

    const activeTokenLists = computed(() => {
      return store.getters['registry/getTokenLists']({ active: true });
    });

    // METHODS
    function onTokenSearch(event): void {
      let address = event.target.value;
      if (isAddress(address)) {
        address = getAddress(address);
        if (props.excludedTokens.includes(address)) data.isTokenSelected = true;
        else {
          data.isTokenSelected = false;
          store.dispatch('registry/injectTokens', [address.trim()]);
        }
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
      activeTokenLists,
      tokenLists,
      // methods
      onTokenSearch,
      onSelectToken,
      onSelectList,
      onListExit,
      toggleSelectTokenList,
      onClose
    };
  }
});
</script>
