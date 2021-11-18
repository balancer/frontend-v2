<template>
  <BalTooltip width="auto" noPad>
    <template v-slot:activator>
      <div>
        <StarsIcon class="h-5 text-yellow-300" v-bind="$attrs" />
      </div>
    </template>
    <div class="text-sm divide-y dark:divide-gray-900">
      <div class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div class="text-gray-500">{{ $t('totalAPR') }}</div>
        <div class="text-lg">
          {{ fNum(totalApr, 'percent') }}
        </div>
      </div>
      <div class="p-3">
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum(swapApr, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPR') }}</span>
        </div>
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum(fbeetsApr, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">
            fBEETS APR
          </span>
        </div>
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum(farmApr, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">
            Farm APR
          </span>
        </div>
      </div>
    </div>
  </BalTooltip>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  name: 'FreshBeetsAprTooltip',

  props: {
    swapApr: {
      type: Number,
      required: true
    },
    farmApr: {
      type: Number,
      required: true
    },
    fbeetsApr: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();
    const totalApr = computed(() => {
      return props.swapApr + props.farmApr + props.fbeetsApr;
    });

    return { totalApr, fNum };
  }
});
</script>
