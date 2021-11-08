<script setup lang="ts">
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';

/**
 * TYPES
 */
type Props = {
  address: string;
  selected: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken, balanceFor } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();

/**
 * COMPUTED
 */
const token = computed(() => getToken(props.address));

const balanceLabel = computed(() => fNum(balanceFor(props.address), 'token'));

const fiatLabel = computed(() => {
  const tokenBalance = balanceFor(props.address);
  const fiatValue = toFiat(tokenBalance, props.address);

  return fNum(fiatValue, currency.value);
});
</script>

<template>
  <div :class="['flex justify-between', { 'text-gray-400': !selected }]">
    <div class="flex flex-col">
      <span>
        {{ token.symbol }}
      </span>
      <span v-if="token.name !== token.symbol" class="text-sm text-gray-400">
        {{ token.name }}
      </span>
    </div>

    <div class="flex flex-col text-right">
      <span>
        {{ balanceLabel }}
      </span>
      <span class="text-sm text-gray-400">
        {{ fiatLabel }}
      </span>
    </div>
  </div>
</template>
