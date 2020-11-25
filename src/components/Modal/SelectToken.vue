<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Select token</h3>
    </template>
    <div>
      <a
        v-for="(token, i) in tokenlist.tokens"
        :key="i"
        @click="onSelect(token)"
        class="d-block border-bottom p-3"
      >
        <img
          :src="token.logoURI"
          class="circle v-align-middle mr-1"
          width="24"
          height="24"
        />
        {{ token.symbol }}
        {{ token.name }}
      </a>
    </div>
    <template slot="footer">
      <div>
        <Icon name="gear" size="24" class="v-align-middle" />
        {{ tokenlist.name }}
      </div>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    tokenlist: Object
  },
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  }
};
</script>
