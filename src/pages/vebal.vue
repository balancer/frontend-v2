<script setup lang="ts">
import Hero from '@/components/contextual/pages/vebal/Hero.vue';

import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <div v-if="isVeBalSupported" class="lg:container lg:mx-auto pt-10 md:pt-12">
    <Hero />
  </div>
  <div v-else class="text-center">
    <div class="font-semibold text-lg">
      {{ $t('veBAL.notSupported.title') }}
    </div>
    <div>{{ $t('veBAL.notSupported.description') }}</div>
  </div>
</template>
