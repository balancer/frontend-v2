<script lang="ts" setup>
import Vue from 'vue';
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>Max initial liquidity in wallet</h6>
    </div>
    <div class="p-2">
      <div class="grid grid-cols-12 w-full">
        <div class="col-span-5">
          <span class="text-sm font-semibold">Token</span>
        </div>
        <div class="col-span-4 text-right">
          <span class="text-sm font-semibold">USD Value</span>
        </div>
        <div class="col-span-3 text-right">
          <span class="text-sm font-semibold">%</span>
        </div>
      </div>
    </div>
  </BalCard>
</template>
