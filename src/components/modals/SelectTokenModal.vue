<template>
  <BalModal :show="open" @close="$emit('close')" no-content-pad>
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
        v-model="q"
        @input="filterTokenLists"
        :placeholder="$t('searchByName')"
        class="p-4 border-b dark:border-gray-700"
      />
      <div>
        <div
          v-if="Object.keys(tokenLists).length > 0"
          class="h-96 overflow-scroll"
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
          v-text="$t('errorNoLists')"
          class="h-96 flex items-center justify-center"
        />
      </div>
    </template>
    <template v-else>
      <div class="border-b dark:border-gray-700 flex">
        <Search
          v-model="q"
          @input="$emit('inputSearch', q)"
          :placeholder="$t('searchBy')"
          class="p-4 flex-auto"
        />
        <a @click="toggleSelectTokenList" class="p-4">
          <Icon name="down" class="pl-1 pt-1 float-right" />
          <span class="mr-3">
            <img
              v-for="(tokenlist, i) in activeTokenLists"
              :key="i"
              :src="_url(tokenlist.logoURI)"
              class="rounded-full float-right inline-block bg-white align-middle border -ml-3"
              width="26"
              height="26"
            />
          </span>
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
        <div v-else-if="loading" class="h-96 flex items-center justify-center">
          <BalLoadingIcon />
        </div>
        <div
          v-else
          v-text="$t('errorNoTokens')"
          class="h-96 flex items-center justify-center"
        />
      </div>
    </template>
  </BalModal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { clone } from '@/utils';

export default {
  emits: ['close', 'inputSearch', 'selectTokenlist', 'select'],

  props: {
    open: Boolean
  },

  data() {
    return {
      loading: false,
      q: '',
      selectTokenList: false,
      form: {
        tokens: []
      }
    };
  },

  computed: {
    ...mapGetters(['getTokens', 'getTokenlists']),

    title() {
      if (this.selectTokenList) return this.$t('manageLists');
      return this.$t('selectToken');
    },

    tokenlistsReverse() {
      const tokenlists = clone(this.tokenLists);
      return Object.values(tokenlists).reverse();
    },

    tokenLists() {
      return this.getTokenlists({ q: this.q });
    },

    activeTokenLists() {
      return this.getTokenlists({ active: true });
    },

    tokens() {
      return this.getTokens({ q: this.q, not: this.form.tokens });
    }
  },

  methods: {
    ...mapActions(['toggleList']),

    onSelectList(list) {
      this.toggleList(list);
    },

    onSelectToken(token) {
      this.$emit('select', token);
      this.$emit('close');
    },

    onListExit() {
      this.selectTokenList = false;
      this.q = '';
    },

    toggleSelectTokenList() {
      this.selectTokenList = !this.selectTokenList;
      this.q = '';
    },

    filterTokenLists() {
      this.tokenLists = this.getTokenlists({ q: this.q });
    }
  }
};
</script>
