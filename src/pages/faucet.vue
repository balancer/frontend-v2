<script setup lang="ts">
import FaucetTable from '@/components/tables/FaucetTable/FaucetTable.vue';
</script>

<template>
  <div class="px-2 lg:px-0">
    <div class="lg:container lg:mx-auto py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 class="mb-4">
            Faucet
          </h1>
        </div>
      </div>
      <FaucetTable />
    </div>
  </div>
</template>
