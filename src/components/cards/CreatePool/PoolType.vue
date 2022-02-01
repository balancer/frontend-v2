<script setup lang="ts">
import { computed } from "vue";

import { useI18n } from "vue-i18n";

import { PoolType } from "@/services/balancer/subgraph/types";

import NetworkCard from "../NetworkCard/NetworkCard.vue";

const SUPPORTED_POOL_TYPES = [PoolType.Weighted, PoolType.Managed];

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const poolTypeDescriptionMap: Partial<Record<PoolType, string>> = {
  [PoolType.Weighted]: t('createAPool.weightedPoolDescription'),
  [PoolType.Managed]: t('createAPool.managedPoolDescription')
}

/** VIEW ONLY COMPONENT */
const PoolTypeButton = {
  props: {
    title: String,
    text: String,
  },
  template: /*html*/ `
    <button class="border bg-white rounded-xl buttonShadow relative p-4 hoverOutline">
      <BalStack horizontal align='center' class="relative">
        <div class="rounded-lg poolImage border bg-gray-50 w-24 h-24" />
        <BalStack vertical spacing="xs" align="start">
          <h5 class="font-bold dark:text-gray-300">
            {{ title }}
          </h5>
          <p class="text-sm text-left">
            {{ text }}
          </p>
        </BalStack>
        <BalIcon name="chevron-right" class="absolute right-0 text-blue-500" />
      </BalStack>
    </button>
  `,
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
        />
      </BalStack>
    </NetworkCard>
    <BalCard class="bg-transparent" shadow="none">
      <BalStack vertical spacing="sm" >
        <h6>{{ $t('createAPool.learnOtherPoolTypes') }}</h6>
        <p>{{ $t('createAPool.poolsNotSupportedYet') }}</p>
      </BalStack>
    </BalCard>
  </BalStack>
</template>

<style>
.hoverOutline:hover {
  box-shadow: 0 0 0 2px rgb(56, 74, 255);
  transition: box-shadow 0.35s;
}

.poolImage {
  min-width: 6rem;
  min-height: 6rem;
}
.buttonShadow {
  position: relative;
  z-index: auto;
}
.buttonShadow:after {
  content: "";
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
