<template>
  <Exchanger
    :tokens="tokens"
    :sendTokens="pool.tokens"
    :receiveTokens="[pool.tokenizer.address]"
    @submit="$emit('submit', $event)"
    :submit="'Buy'"
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
