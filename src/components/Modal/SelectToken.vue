<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="$t('selectToken')" />
    </template>
    <div class="border-b flex">
      <Search
        v-model="q"
        @input="$emit('inputSearch', q)"
        :placeholder="$t('searchBy')"
        class="p-4 flex-auto"
      />
      <a @click="$emit('selectTokenlist')" class="p-4">
        <span class="mr-3">
          <img
            v-for="(tokenlist, i) in tokenlistsReverse"
            :key="i"
            :src="_url(tokenlist.logoURI)"
            class="rounded-full float-right inline-block bg-white align-middle border -ml-3"
            width="28"
            height="28"
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
          class="block border-b flex last-child-border-0 py-3 px-4 highlight items-center leading-5"
        >
          <Token :token="token" :size="32" class="mr-2" />
          <div class="flex-auto">
            <div>{{ token.name }}</div>
            <div class="text-gray">{{ token.symbol }}</div>
          </div>
          <span v-if="token.balance > 0" class="text-right">
            <div>{{ _num(token.balance, '0,0.[000]') }}</div>
            <div v-if="token.value > 0" class="text-gray">
              {{ _num(token.value, '$0,0.[00]') }}
            </div>
          </span>
        </a>
      </div>
      <div v-else-if="loading" class="block text-center p-4">
        <UiLoading />
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
  emits: ['close', 'inputSearch'],
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
