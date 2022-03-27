<script setup lang="ts">
/**
 * veBAL page
 */
import Hero from '@/components/contextual/pages/vebal/Hero.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';

import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <div v-if="isVeBalSupported" class="">
    <div class="pb-12">
      <Hero />
    </div>
  </div>
  <div v-if="isVeBalSupported" class="lg:container lg:mx-auto">
    <div class="mb-16 px-1 lg:px-0">
      <MyVeBAL />
    </div>
    <div class="mb-16 px-1 lg:px-0">
      <LMVoting />
    </div>
  </div>
  <div v-else class="text-center">
    <div class="font-semibold text-lg">
      {{ $t('veBAL.notSupported.title') }}
    </div>
    <div>{{ $t('veBAL.notSupported.description') }}</div>
  </div>
</template>
