<template>
  <div class="overflow-x-auto whitespace-nowrap text-base">
    <table class="min-w-full text-black">
      <tr class="bg-gray-50">
        <th
          v-text="$t('poolName')"
          class="sticky top-0 p-2 pl-4 py-6 text-left"
        />
        <th v-text="$t('myShare')" class="sticky top-0 p-2 py-6 text-right" />
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
      <TableRowPortfolioPool
        class="cursor-pointer hover:bg-gray-50"
        v-for="pool in pools"
        :key="pool.address"
        @click="openPool(pool)"
        :pool="pool"
        :tokens="tokens"
      />
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
    }
  }
};
</script>
