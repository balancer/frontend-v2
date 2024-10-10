<script setup lang="ts">
import HomePageHero from '@/components/heros/HomePageHero.vue';
</script>

<template>
  <div>
    <HomePageHero />
    <div class="px-3 pt-10 md:pt-8 mx-auto max-w-md">
      <h1 class="mb-4 text-2xl font-bold">This UI is mostly deprecated</h1>
      <p>
        Please use the new UI at
        <BalLink href="https://balancer.fi" external>balancer.fi</BalLink>
        to:
      </p>
      <ul class="pl-5 list-disc">
        <li>Explore pools</li>
        <li>Add and remove liquidity</li>
        <li>Swap tokens</li>
        <li>View your portfolio</li>
      </ul>
      <p class="mt-4">You can continue to use this UI to:</p>
      <ul class="pl-5 list-disc">
        <li>Manage your veBAL</li>
        <li>Claim old incentives</li>
      </ul>
    </div>
  </div>
</template>
