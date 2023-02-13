<script lang="ts" setup>
import { computed } from 'vue';

import AppHero from '@/components/heros/AppHero.vue';
import { EXTERNAL_LINKS } from '@/constants/links';

/**
 * COMPOSABLES
 */

/**
 * COMPUTED
 */
const classes = computed(() => ({}));
</script>

<template>
  <AppHero :class="classes">
    <h1 class="headline" v-text="$t('defiLiquidityPools')" />
    <p class="mt-2 text-xl text-white" v-text="$t('builtOnBalancer')" />
    <div class="flex justify-center mt-6">
      <BalBtn
        tag="a"
        :href="EXTERNAL_LINKS.Balancer.Home"
        target="_blank"
        rel="noreferrer"
        color="white"
        outline
      >
        {{ $t('learnMore') }}
        <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
      </BalBtn>
    </div>
  </AppHero>
</template>

<style>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-display font-normal;
}
</style>
