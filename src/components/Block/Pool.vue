<template>
  <div class="p-4 d-flex flex-justify-between">
    <div>
      <span>
        <span v-for="token in pool.tokens" :key="token">
          <Token :token="tokens[token]" class="mr-1" />
        </span>
      </span>
      <span class="ml-2">
        {{ shares }}
      </span>
      <span class="ml-2">
        {{ symbols }}
      </span>
    </div>
    <div>
      <span class="d-inline-block column-sm text-right">{{
        _num(pool.liquidity, '$0,0')
      }}</span>
      <span class="d-inline-block column-sm text-right ml-2">{{
        _num(pool.totalSwapVolume, '$0,0')
      }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pool: Object,
    tokens: Object
  },
  computed: {
    symbols() {
      return this.pool.tokens
        .map(poolToken => this.tokens[poolToken].symbol)
        .join('/');
    },
    shares() {
      return this.pool.tokens
        .map((_poolToken, i) => this._num(this.pool.strategy.weightsPercent[i]))
        .join('/');
    }
  }
};
</script>
