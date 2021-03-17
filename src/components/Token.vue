<template>
  <span class="inline-block v-align-middle leading-none">
    <img
      v-if="!error"
      :src="_url(token.logoURI)"
      :style="{
        width: `${size || 24}px`,
        height: `${size || 24}px`
      }"
      @error="error = true"
      class="rounded-full inline-block bg-white leading-none"
    />
    <Avatar v-else :address="token.address" :size="size || 24" />
    <span v-if="symbol || name" class="ml-1">
      <span v-if="symbol" class="ml-1">
        {{ _shorten(token.symbol, 'symbol') }}
      </span>
      <span v-if="name" class="ml-1">
        {{ _shorten(token.name, 'name') }}
      </span>
      <a
        v-if="name && token.injected"
        aria-label="This token is injected"
        class="align-middle leading-none tooltipped tooltipped-n ml-1"
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
