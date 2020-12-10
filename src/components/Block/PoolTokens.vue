<template>
  <Block title="Tokens" :counter="tokens.length" :slim="true">
    <div
      v-for="(token, i) in tokens"
      :key="token.address"
      class="px-4 py-3 d-flex border-bottom last-child-border-0"
    >
      <div class="flex-auto text-white">
        <Token :token="token" :size="16" :symbol="true" />
        <span v-if="tokenWeights[i]"> {{ _numeral(tokenWeights[i]) }}% </span>
      </div>
      <div>
        {{ _numeral(_units(tokenBalances[i], token.decimals)) }}
      </div>
    </div>
  </Block>
</template>

<script>
export default {
  props: {
    tokens: Array,
    tokenBalances: Array,
    tokenWeights: Array
  }
};
</script>
