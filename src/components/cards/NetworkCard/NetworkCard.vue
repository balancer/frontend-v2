<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  title: string;
};

withDefaults(defineProps<Props>(), {
  title: ''
});

/**
 * COMPOSABLES
 */
const { userNetworkConfig } = useWeb3();

/**
 * COMPUTED
 */
const networkName = computed(() => userNetworkConfig.value?.name);
</script>

<template>
  <BalCard shadow="xl" noBorder>
    <BalStack vertical spacing="sm">
      <BalStack vertical spacing="xs">
        <span class="text-xs text-gray-700 dark:text-gray-500">{{
          networkName
        }}</span>
        <h5 class="font-bold dark:text-gray-300">
          {{ title }}
        </h5>
      </BalStack>
    </BalStack>
    <slot />
  </BalCard>
</template>
