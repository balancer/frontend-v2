<template>
  <Block>
    {{ _shorten(pool.id) }}<br />
    Strategy: {{ pool.strategy.name }} ({{ pool.strategyType }})<br />
    Swap fee: {{ _numeral(pool.strategy.swapFeePercent) }}%<br />
    <div>
      <span v-for="token in pool.tokens" :key="token" class="mr-2">
        <Token
          :url="tokens[token].logoURI"
          :address="tokens[token].address"
          :size="24"
          class="mr-1"
        />
        {{ _shorten(tokens[token].symbol, 'symbol') }}
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
