<template>
  <div class="px-4 py-3 flex justify-between highlight">
    <div class="flex">
      <div class="icons relative">
        <span
          v-for="(token, i) in pool.tokens"
          :key="token"
          class="icon absolute"
          :style="{ left: `${(26 * i) / (pool.tokens.length - 1)}px` }"
        >
          <Token :token="tokens[token]" />
        </span>
      </div>
      <span class="ml-2">
        {{ shares }}
      </span>
      <span class="ml-2">
        {{ symbols }}
      </span>
    </div>
    <div class="hidden sm:inline-block">
      <span class="inline-block column-sm text-right">{{
        _num(pool.liquidity, '$0,0')
      }}</span>
      <span class="inline-block column-sm text-right ml-2">{{
        _num(pool.totalSwapVolume, '$0,0')
      }}</span>
      <span class="inline-block column-sm text-right ml-2">{{
        _num(pool.apy, '0,0%')
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
        .map((_poolToken, i) => this._num(this.pool.weightsPercent[i]))
        .join('/');
    }
  }
};
</script>

<style scoped>
.column-sm {
  width: 120px;
}

.icons {
  width: 50px;
}

.icon:hover {
  z-index: 2;
}
</style>
