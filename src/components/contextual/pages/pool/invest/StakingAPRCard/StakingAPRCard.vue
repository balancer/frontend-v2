<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { computed, onBeforeMount, ref } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';

type Props = {
  poolId: string;
};
defineProps<Props>();

/**
 * STATE
 */
// TODO INTEGRATE STAKING APR
const isLoading = ref(true);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
// TODO INTEGRATE STAKING APR
const apr = computed(() => {
  return 0.1245;
});

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 4000);
});
</script>

<template>
  <AnimatePresence :isVisible="!isLoading">
    <BalCard shadow="none">
      <BalStack horizontal justify="between" align="center">
        <BalStack spacing="sm" align="center">
          <div
            class="flex items-center p-1 bg-green-500 text-white rounded-full"
          >
            <BalIcon size="sm" name="check" />
          </div>
          <h6>{{ $t('staking') }}</h6>
        </BalStack>
        <BalStack horizontal spacing="sm" align="center">
          <h6>{{ $t('apr') }}: {{ fNum2(apr, FNumFormats.percent) }}</h6>
          <StarsIcon />
        </BalStack>
      </BalStack>
    </BalCard>
  </AnimatePresence>
  <AnimatePresence :isVisible="isLoading" unmountInstantly>
    <BalLoadingBlock class="h-12" />
  </AnimatePresence>
</template>
