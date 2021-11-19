<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import FreshBeetsAprTooltip from '@/beethovenx/components/pages/fbeets/FreshBeetsAprTooltip.vue';
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols3 gap-4 w-full max-w-3xl mb-4"
  >
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        BPT Staked
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        23%
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        BEETS Staked
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        23%
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        fBEETS APR
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        320%
        <FreshBeetsAprTooltip :swap-apr="20" :farm-apr="20" :fbeets-apr="20" />
      </div>
    </BalCard>
  </div>
</template>
