<script lang="ts" setup>
import { EXTERNAL_LINKS } from '@/constants/links';
</script>

<template>
  <h1 class="headline" />
  <p class="mt-2 text-xl text-white" />
  <div class="flex justify-center mt-6">
    HOME PAGE HERO
    <a :href="EXTERNAL_LINKS.Balancer.Home" target="_blank" class="bg-white">
    </a>
  </div>
</template>

<style>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-display font-normal;
}
</style>
