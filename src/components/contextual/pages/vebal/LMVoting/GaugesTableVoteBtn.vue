<script setup lang="ts">
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  isGaugeExpired: boolean;
  hasUserVotes: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const showRemoveVotes = computed(() => {
  return props.isGaugeExpired && props.hasUserVotes;
});

const disabled = computed(() => {
  return props.isGaugeExpired && !props.hasUserVotes;
});
</script>

<template>
  <BalBtn
    :color="showRemoveVotes ? 'red' : 'blue'"
    :disabled="disabled"
    :class="`vote-btn
      ${showRemoveVotes ? 'vote-btn--red' : 'vote-btn--blue'}`"
    outline
    size="sm"
    flat
    block
  >
    {{
      showRemoveVotes
        ? $t('veBAL.liquidityMining.table.remove')
        : $t('veBAL.liquidityMining.table.vote')
    }}
  </BalBtn>
</template>

<style scoped>
.vote-btn:not(:disabled) {
  @apply hover:text-white focus:text-white;
}

.vote-btn--blue:not(:disabled) {
  @apply hover:bg-blue-500 focus:bg-blue-500 dark:hover:bg-blue-500 dark:focus:bg-blue-500;
}

.vote-btn--red:not(:disabled) {
  @apply hover:bg-red-500  focus:bg-red-500;
}
</style>
