<template>
  <Block>
    {{ _shorten(pool.id) }}<br />
    Strategy: {{ pool.strategy.name }} ({{ pool.strategyType }})<br />
    Swap fee: {{ _numeral(pool.strategy.swapFeePercent) }}%<br />
    <div>
      <span v-for="(token, i) in pool.tokens" :key="token" class="mr-2">
        <Token :token="tokens[token]" :symbol="true" class="mr-1" />
	      {{ _numeral(pool.strategy.weightsPercent[i]) }}%
      </span>
    </div>
  </Block>
</template>

<script>
export default {
  props: {
    pool: Object,
    tokens: Object
  }
};
</script>
