<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

type Props = {
  address: string;
  symbol: string;
  weight: number | string;
  iconURI?: string;
};

const props = defineProps<Props>();

const { fNum } = useNumbers();
</script>

<template>
  <div class="flex items-center">
    <BalAsset :address="props.address" :iconURI="props.iconURI" />
    <span class="ml-2">{{ props.symbol }}</span>
    <span class="font-medium text-gray-400 ml-1">
      {{ fNum(props.weight, 'percent_lg') }}
    </span>
  </div>
</template>
