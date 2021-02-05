<template>
  <div class="p-4">
    {{ _shorten(pool.id) }}<br />
    {{ $t('strategy') }}: {{ $t(pool.strategy.name) }} ({{
      pool.strategyType
    }})<br />
    {{ $t('swapFee') }}: {{ _num(pool.strategy.swapFeePercent) }}%<br />
    <div>
      <span v-for="(token, i) in pool.tokens" :key="token" class="mr-2">
        <Token :token="tokens[token]" :symbol="true" class="mr-1" />
        <template v-if="pool.strategy.weightsPercent">
          {{ _num(pool.strategy.weightsPercent[i]) }}%
        </template>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pool: Object,
    tokens: Object
  }
};
</script>
