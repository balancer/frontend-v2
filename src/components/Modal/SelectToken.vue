<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Select a token</h3>
    </template>
    <Search
      @input="$emit('inputSearch', $event)"
      placeholder="Search by name, symbol or address"
      class="p-3 border-bottom"
    />
    <div
      v-if="tokenlist.tags && Object.keys(tokenlist.tags).length > 0"
      class="d-block border-bottom p-3 sliding"
    >
      <UiTag v-for="(tag, i) in tokenlist.tags" :key="i" class="mr-2">
        {{ tag.name }}
      </UiTag>
    </div>
    <div>
      <div v-if="tokens.length > 0">
        <a
          v-for="(token, i) in tokens"
          :key="i"
          @click="onSelect(token)"
          class="d-block border-bottom last-child-border-0 p-3 highlight"
        >
          <Token :token="token" :symbol="true" :name="true" />
          <span class="float-right text-gray">
            {{ _numeral(token.balance) }}
          </span>
        </a>
      </div>
      <div v-else-if="loading" class="d-block text-center p-3">
        <UiLoading />
      </div>
      <div v-else class="d-block text-center p-3">
        Oops, we can't find any tokens
      </div>
    </div>
    <template v-if="tokenlist.name" slot="footer">
      <div class="text-left text-white">
        <img
          v-if="tokenlist.logoURI"
          :src="_url(tokenlist.logoURI)"
          class="circle bg-white v-align-middle mr-1"
          width="24"
          height="24"
        />
        {{ tokenlist.name }}
        <a @click="$emit('selectTokenlist')" class="float-right">
          Change
        </a>
      </div>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    tokens: Array,
    tokenlist: Object,
    loading: Boolean
  },
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  }
};
</script>
