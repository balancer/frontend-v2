<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
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
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const networkName = computed(() => userNetworkConfig.value?.name);
</script>

<template>
  <BalCard
    shadow="card"
    noPad
    :square="upToLargeBreakpoint"
    class="lg:rounded-2xl p-5"
  >
    <BalStack vertical spacing="base">
      <BalStack vertical spacing="sm">
        <BalStack vertical spacing="xs">
          <span class="text-xs text-gray-700 dark:text-gray-500">{{
            networkName
          }}</span>
          <h4 class="font-bold dark:text-gray-300">
            {{ title }}
          </h4>
        </BalStack>
      </BalStack>
      <slot />
      <div></div>
    </BalStack>
  </BalCard>
</template>
