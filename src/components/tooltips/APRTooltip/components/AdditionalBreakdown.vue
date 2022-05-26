<script lang="ts" setup>
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

type Props = {
  aprs: Record<string, string>;
};

defineProps<Props>();

const { fNum2 } = useNumbers();
</script>

<template>
  <div>
    <div v-for="(apr, key) in aprs" :key="key" class="flex items-center">
      {{ fNum2(apr, FNumFormats.percent) }}
      <span class="ml-1 text-gray-500 text-xs">
        {{ $t(key) }}
      </span>
    </div>
  </div>
</template>
