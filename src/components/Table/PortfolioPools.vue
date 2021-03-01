<template>
  <div class="overflow-x-auto whitespace-nowrap text-base">
    <table class="min-w-full text-black">
      <tr class="bg-gray-50">
        <th class="sticky top-0 p-2 pl-4 py-6 text-left">Pool name</th>
        <th class="sticky top-0 p-2 py-6 text-right">My share</th>
        <th class="sticky top-0 p-2 py-6 text-right">Pool value</th>
        <th class="sticky top-0 p-2 py-6 text-right">Volume (24h)</th>
        <th class="sticky top-0 p-2 pr-4 py-6 text-right">APY (1y)</th>
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
