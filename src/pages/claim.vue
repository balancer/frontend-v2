<script lang="ts" setup>
import StatCard from '@/components/cards/StatCard/StatCard.vue';
</script>

<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="grid gap-24 grid-cols-2 grid-rows-1">
      <div class="">
        <h1 class="font-body font-bold text-4xl">
          Claim all of your liquidity incentives
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          The Balancer protocol provides incentives to attract liquidity in eligible pools.
        </p>
        <BalBtn outline class="mt-4">
          Learn more
          <BalIcon name="arrow-up-right" class="ml-2" />
        </BalBtn>
      </div>
      <div class="grid gap-4 grid-cols-2 grid-rows-2">
        <StatCard label="My claimable incentives" value="$10,400.00" />
        <StatCard label="My 30d yield" value="$480.56" />
        <StatCard label="My 24h yield" value="$12.6845" />
        <StatCard label="My 24h APR" value="12.46%" />
      </div>
    </div>
  </div>
</template>
