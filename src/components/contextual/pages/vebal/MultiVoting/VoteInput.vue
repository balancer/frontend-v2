<script lang="ts" setup>
import TimeLockedVote from '@/components/contextual/pages/vebal/MultiVoting/TimeLockedVote.vue';
import OverLimitVote from '@/components/contextual/pages/vebal/MultiVoting/OverLimitVote.vue';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { isPositive } from '@/lib/utils/validations';
import VotePoolDetails from './VotePoolDetails.vue';
import VotePoolFooter from './VotePoolFooter.vue';

/**
 * TYPES
 */
type Props = {
  pool: VotingPool;
  modelValue?: string;
};
/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/**
 * STATE
 */
const inputRules = [isPositive()];

/**
 * METHODS
 */
</script>

<template>
  <div class="special-input">
    <BalTextInput
      :modelValue="modelValue"
      v-bind="$attrs"
      class="mb-2"
      type="number"
      name="poolVote"
      :rules="inputRules"
      inputAlignRight
      placeholder="0"
      @input="val => emit('update:modelValue', val)"
    >
      <template #prepend>
        <VotePoolDetails :pool="pool" />
      </template>
      <template #append>
        <div class="flex items-center px-2 h-full">
          <span class="text-xl text-black dark:text-white">%</span>
          <TimeLockedVote class="ml-2" :pool="pool" />
          <OverLimitVote class="ml-2" :pool="pool" />
        </div>
      </template>
      <template #footer>
        <VotePoolFooter :pool="pool" />
      </template>
    </BalTextInput>
  </div>
</template>

<style lang="css" scoped>
.special-input :deep(input) {
  @apply w-14 ml-auto;

  min-width: 3.5rem;
}
</style>
