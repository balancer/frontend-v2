<template>
  <Exchanger
    :tokens="tokens"
    :sendTokens="[pool.tokenizer.address]"
    :receiveTokens="pool.tokens"
    @submit="$emit('submit', $event)"
    :submit="'Sell'"
  />
</template>

<script>
export default {
  props: {
    tokens: Object,
    pool: Object
  }
};
</script>
