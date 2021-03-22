<template>
  <BalModal
    :show="open"
    :title="$t('selectToken')"
    @close="$emit('close')"
    no-content-pad
  >
    <template v-if="selectTokenlist">
      <Search
        v-model="q"
        @input="filterTokenLists"
        :placeholder="$t('searchByName')"
        class="p-4 border-b dark:border-gray-700"
      />
      <div>
        <div
          v-if="Object.keys(tokenlists).length > 0"
          class="h-96 overflow-scroll"
        >
          <a v-for="(tokenlist, i) in tokenlists" :key="i" @click="onSelect(i)">
            <RowTokenlist :tokenlist="tokenlist" />
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
        <a @click="toggleList" class="p-4">
          <Icon name="down" class="pl-1 pt-1 float-right" />
          <span class="mr-3">
            <img
              v-for="(tokenlist, i) in tokenlistsReverse"
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
            @click="onSelect(token.address)"
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
import { mapGetters } from 'vuex';
import { clone } from '@/utils';

export default {
  emits: ['close', 'inputSearch', 'selectTokenlist', 'select'],

  props: {
    open: Boolean,
    tokens: Object,
    loading: Boolean
  },

  data() {
    return {
      q: '',
      selectTokenlist: false,
      tokenLists: {}
    };
  },

  computed: {
    ...mapGetters(['getTokens', 'getTokenlists']),

    tokenlistsReverse() {
      const tokenlists = clone(this.tokenlists);
      return Object.values(tokenlists).reverse();
    }
  },

  beforeMount() {
    this.tokenLists = this.getTokenlists({ active: true });
  },

  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    },

    toggleList() {
      this.selectTokenlist = !this.selectTokenlist;
      this.q = '';
    },

    filterTokenLists() {
      this.tokenLists = this.getTokenlists({ q: this.q });
    }
  }
};
</script>
