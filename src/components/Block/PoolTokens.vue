<template>
  <BalCard :title="$t('tokens')" noContentPad>
    <div
      v-for="(token, key, i) in tokens"
      :key="key"
      class="px-5 py-4 flex border-b dark:border-gray-700 last:border-0"
    >
      <div class="flex-auto link-color">
        <Token :token="token" :symbol="true" />
        <span v-if="tokenWeights[i]" class="ml-1">
          {{ _num(tokenWeights[i]) }}%
        </span>
      </div>
      <div>
        {{ _num(_units(tokenBalances[i], token.decimals)) }}
      </div>
    </div>
  </BalCard>
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
