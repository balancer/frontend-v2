<template>
  <div class="overflow-x-auto whitespace-nowrap text-base">
    <table class="min-w-full text-black bg-white dark:bg-gray-900">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th
          v-text="$t('poolName')"
          class="sticky top-0 p-2 pl-4 py-6 text-left"
        />
        <th v-text="$t('poolValue')" class="sticky top-0 p-2 py-6 text-right" />
        <th
          v-text="$t('volume24h', [$t('hourAbbrev')])"
          class="sticky top-0 p-2 py-6 text-right"
        />
        <th
          v-text="$t('apy', [$t('yearAbbrev')])"
          class="sticky top-0 p-2 pr-4 py-6 text-right"
        />
      </tr>
      <tr
        class="row cursor-pointer hover:bg-gray-50"
        v-for="pool in pools"
        :key="pool.address"
        @click="openPool(pool)"
      >
        <td class="p-2 pl-4 py-6 flex">
          <div class="w-20 relative">
            <span
              v-for="(token, i) in pool.tokens"
              :key="token"
              class="hover:z-10 absolute"
              :style="{ left: `${getIconPosition(i, pool.tokens.length)}px` }"
            >
              <Token :token="tokens[token]" />
            </span>
          </div>
          <div>
            <span class="ml-2" v-for="(token, i) in pool.tokens" :key="token">
              <span v-if="pool.strategy.weightsPercent">
                {{ _num(pool.strategy.weightsPercent[i]) }}
              </span>
              {{ tokens[token].symbol }}
            </span>
          </div>
        </td>
        <td class="p-2 py-6 text-right">
          {{ _num(pool.liquidity, '$0,0') }}
        </td>
        <td class="p-2 py-6 text-right">
          {{ _num(pool.totalSwapVolume, '$0,0') }}
        </td>
        <td class="p-2 pr-4 py-6 text-right">
          {{ _num(pool.apy, '0,0%') }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    pools: Object,
    tokens: Object
  },
  methods: {
    openPool(pool) {
      this.$router.push({ name: 'pool', params: { id: pool.id } });
    },
    getIconPosition(i, count) {
      if (count < 3) {
        return 28 * i;
      }
      if (count === 3) {
        return 24 * i;
      }
      return (48 * i) / (count - 1);
    }
  }
};
</script>

<style scoped>
table {
  color: var(--text-color);
}

.header {
  background-color: var(--bg-color);
}

.row:hover {
  background-color: var(--bg-color);
}
</style>
