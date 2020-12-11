<template>
  <span class="d-inline-block v-align-middle line-height-0">
    <img
      v-if="!error"
      :src="_url(token.logoURI)"
      :style="{
        width: `${size || 24}px`,
        height: `${size || 24}px`
      }"
      @error="error = true"
      class="circle v-align-middle bg-white border line-height-0"
    />
    <Avatar v-else :address="token.address" :size="size || 24" />
    <span v-if="symbol || name" class="ml-1">
      <template v-if="symbol">
        {{ _shorten(token.symbol, 'symbol') }}
      </template>
      <template v-if="name">
        {{ _shorten(token.name, 'name') }}
      </template>
      <a
        v-if="name && token.injected"
        aria-label="This token is injected"
        class="v-align-middle line-height-0 tooltipped tooltipped-n"
      >
        <Icon name="info" size="24" class="text-gray" />
      </a>
    </span>
  </span>
</template>

<script>
export default {
  props: {
    token: Object,
    address: String,
    size: Number,
    symbol: Boolean,
    name: Boolean
  },
  data() {
    return {
      error: false
    };
  }
};
</script>
