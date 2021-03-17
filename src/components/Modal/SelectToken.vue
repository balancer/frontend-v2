<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="$t('selectToken')" />
    </template>
    <div class="border-b dark:border-gray-700 flex">
      <Search
        v-model="q"
        @input="$emit('inputSearch', q)"
        :placeholder="$t('searchBy')"
        class="p-4 flex-auto"
      />
      <a @click="$emit('selectTokenlist')" class="p-4">
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
      <div v-if="Object.keys(tokens).length > 0">
        <a
          v-for="(token, key) in tokens"
          :key="key"
          @click="onSelect(token.address)"
        >
          <RowToken :token="token" />
        </a>
      </div>
      <div v-else-if="loading" class="block text-center p-4">
        <BalLoadingIcon />
      </div>
      <div v-else v-text="$t('errorNoTokens')" class="block text-center p-4" />
    </div>
  </UiModal>
</template>

<script>
import { clone } from '@/utils';

export default {
  data() {
    return {
      q: ''
    };
  },
  props: {
    open: Boolean,
    tokens: Object,
    tokenlists: Object,
    loading: Boolean
  },
  emits: ['close', 'inputSearch', 'selectTokenlist', 'select'],
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  },
  computed: {
    tokenlistsReverse() {
      const tokenlists = clone(this.tokenlists);
      return Object.values(tokenlists).reverse();
    }
  }
};
</script>
