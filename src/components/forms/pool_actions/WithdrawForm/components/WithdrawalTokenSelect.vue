<script setup lang="ts">
import useTokens from '@/composables/useTokens';
import { computed, ref } from 'vue';

/**
 * TYPES
 */
type Props = {
  tokenAddresses: string[];
};

/**
 * Props
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const selectedOption = ref('all');

/**
 * COMPOSABLES
 */
const { getTokens } = useTokens();

/**
 * COMPUTED
 */
const tokens = computed(() => getTokens(props.tokenAddresses));

const options = computed(() => ['all', ...Object.values(tokens.value)]);
</script>

<template>
  <BalDropdown :options="options">
    <template #activator>
      <div class="w-24 h-8 bg-gray-500"></div>
    </template>
    <template #option="{ option }">
      <div v-if="option === 'all'" class="flex items-center">
        <BalAssetSet :addresses="tokenAddresses" :width="70" />
        All tokens
      </div>
      <div v-else class="flex items-center justify-between">
        <BalAsset :address="option.address" class="mr-2" />
        {{ option.symbol }}
      </div>
    </template>
  </BalDropdown>
</template>
