<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Select token</h3>
    </template>
    <Search
      placeholder="Search by name, symbol or address"
      class="p-3 border-bottom"
    />
    <div>
      <a
        v-for="(token, i) in tokens"
        :key="i"
        @click="onSelect(token)"
        class="d-block border-bottom last-child-border-0 p-3"
      >
        <img
          :src="token.logoURI"
          class="circle v-align-middle mr-1"
          width="24"
          height="24"
        />
        {{ token.symbol }}
        {{ token.name }}
        <span class="float-right text-gray">
          {{ _numeral(_units(balances[token.address], token.decimals)) }}
        </span>
      </a>
    </div>
    <template slot="footer">
      <a>
        <Icon name="gear" size="24" class="v-align-middle" />
        {{ tokenlist.name }}
      </a>
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
