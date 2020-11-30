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
    <div>
      <div v-if="tokens.length > 0">
        <a
          v-for="(token, i) in tokens"
          :key="i"
          @click="onSelect(token)"
          class="d-block border-bottom last-child-border-0 p-3"
        >
          <img
            :src="_url(token.logoURI)"
            class="circle v-align-middle mr-1"
            width="24"
            height="24"
          />
          {{ _shorten(token.symbol, 'symbol') }}
          {{ _shorten(token.name, 'name') }}
          <span class="float-right text-gray">
            {{ _numeral(token.balance) }}
          </span>
        </a>
      </div>
      <div v-else class="d-block text-center p-3">
        Sorry, we can't find any tokens
      </div>
    </div>
    <template slot="footer">
      <div class="text-left text-white">
        <img
            :src="_url(tokenlist.logoURI)"
            class="circle v-align-middle mr-1"
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
    balances: {}
  },
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  }
};
</script>
