<template>
  <div class="p-4">
	  {{ _shorten(pool.id) }}<br/>
	  Strategy: {{ pool.strategy.name }} ({{ pool.strategyType }})<br/>
	  Swap fee: {{ $n(pool.strategy.swapFeePercent) }}%<br/>
	  <div>
      <span v-for="(token, i) in pool.tokens" :key="token" class="mr-2">
        <Token :token="tokens[token]" :symbol="true" class="mr-1"/>
        {{ $n(pool.strategy.weightsPercent[i]) }}%
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
