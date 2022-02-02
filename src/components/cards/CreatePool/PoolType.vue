<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { PoolType } from '@/services/balancer/subgraph/types';

import NetworkCard from '../NetworkCard/NetworkCard.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * CONSTANTS
 */
const SUPPORTED_POOL_TYPES = [PoolType.Weighted, PoolType.Managed];

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { type: poolType, proceed } = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const poolTypeDescriptionMap: Partial<Record<PoolType, string>> = {
  [PoolType.Weighted]: t('createAPool.weightedPoolDescription'),
  [PoolType.Managed]: t('createAPool.managedPoolDescription')
};

/**
 * METHODS
 */
function handlePoolTypeSelected(chosenPoolType: PoolType) {
  poolType.value = chosenPoolType;
  proceed();
}

/** VIEW ONLY COMPONENTS */
const PoolTypeButton = {
  props: {
    title: String,
    text: String
  },
  template: /*html*/ `
    <button class="border bg-white rounded-xl relative p-4 pool-type-button">
      <BalStack horizontal align='center' class="relative">
        <div class="rounded-lg pool-type-image border bg-gray-50 w-24 h-24" />
        <BalStack vertical spacing="xs" align="start">
          <h5 class="font-bold dark:text-gray-300">
            {{ title }}
          </h5>
          <p class="text-sm text-left">
            {{ text }}
          </p>
        </BalStack>
        <BalIcon name="chevron-right" class="chevron absolute right-0 text-blue-500" />
      </BalStack>
    </button>
  `
};
</script>

<template>
  <BalStack vertical>
    <NetworkCard :title="$t('poolType')">
      <BalStack vertical>
        <PoolTypeButton
          v-for="poolType in SUPPORTED_POOL_TYPES"
          :key="poolType"
          :text="poolTypeDescriptionMap[poolType]"
          :title="`${poolType} ${$t('pool')}`"
          @click="handlePoolTypeSelected(poolType)"
        />
      </BalStack>
    </NetworkCard>
    <BalCard
      :noBorder="upToLargeBreakpoint"
      class="rounded-xl"
      shadow="none"
      noBackground
    >
      <BalStack vertical spacing="sm">
        <h6 class="font-bold">{{ $t('createAPool.learnOtherPoolTypes') }}</h6>
        <p>{{ $t('createAPool.poolsNotSupportedYet') }}</p>
        <ul class="pl-4 list-disc list-inside leading-5">
          <li>{{ $t('stablePools') }}</li>
          <li>{{ $t('metaStablePools') }}</li>
          <li>{{ $t('lbps') }}</li>
          <li>{{ $t('boostedPools') }}</li>
        </ul>
      </BalStack>
    </BalCard>
  </BalStack>
</template>

<style>
.pool-type-button {
  position: relative;
  z-index: auto;
}
.pool-type-button:hover {
  box-shadow: 0 0 0 2px rgb(56, 74, 255);
  transition: box-shadow 0.35s;
}
.pool-type-button:hover .chevron {
  transform: translateX(0.25rem);
  transition: transform cubic-bezier(0.075, 0.82, 0.165, 1) 0.35s;
}
.pool-type-button .chevron {
  transform: translateX(0);
  transition: transform cubic-bezier(0.075, 0.82, 0.165, 1) 0.35s;
}
.pool-type-image {
  min-width: 6rem;
  min-height: 6rem;
}
/* prevents shadow bleed by applying the shadow on a pseudo with a lower zIndex */
.pool-type-button:after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  @apply shadow-2xl;
}
</style>
