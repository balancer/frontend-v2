<script setup lang="ts">
/**
 * veBAL page
 */
import Hero from '@/components/contextual/pages/vebal/Hero.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <div v-if="isVeBalSupported" class="">
    <div>
      <Hero />
    </div>
  </div>
  <div class="py-16 xl:py-20 bg-gray-50 dark:bg-gray-900">
    <div v-if="isVeBalSupported" class="lg:container lg:mx-auto">
      <div class="px-1 lg:px-0">
        <MyVeBAL />
      </div>
    </div>
  </div>
  <div v-if="isVeBalSupported" class="pt-16 xl:pt-20 lg:container lg:mx-auto">
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
