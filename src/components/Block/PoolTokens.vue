<template>
  <Block :title="$t('tokens')" :counter="tokens.length" :slim="true">
    <div
      v-for="(token, key, i) in tokens"
      :key="key"
      class="px-4 py-3 d-flex border-bottom last-child-border-0"
    >
      <div class="flex-auto text-white">
        <Token :token="token" :symbol="true" />
        <span v-if="tokenWeights[i]"> {{ _num(tokenWeights[i]) }}% </span>
      </div>
      <div>
        {{ _num(_units(tokenBalances[i], token.decimals)) }}
      </div>
    </div>
  </Block>
</template>

<script>
export default {
  props: {
    tokens: Object,
    tokenBalances: Array,
    tokenWeights: Array
  }
};
</script>
