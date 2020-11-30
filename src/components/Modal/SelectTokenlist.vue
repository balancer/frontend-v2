<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Select a token list</h3>
    </template>
    <Search
      placeholder="Search by name, symbol or address"
      class="p-3 border-bottom"
    />
    <div>
      <a
        v-for="(tokenlist, i) in tokenlists"
        :key="i"
        @click="onSelect(i)"
        class="d-block border-bottom last-child-border-0 p-3"
      >
        <img
          :src="_url(tokenlist.logoURI)"
          class="circle v-align-middle mr-1"
          width="24"
          height="24"
        />
        {{ tokenlist.name }}
        <span class="float-right text-gray">
          {{ _numeral(tokenlist.tokens.length) }} tokens
        </span>
      </a>
    </div>
    <template slot="footer">
      <a href="https://tokenlists.org" target="_blank">
        Browse lists
        <Icon name="external-link" class="ml-1" />
      </a>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    tokenlists: Object
  },
  methods: {
    onSelect(name) {
      this.$emit('select', name);
      this.$emit('close');
    }
  }
};
</script>
