<script lang="ts" setup>
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { orderedTokenURIs } from '@/composables/useVotingPools';

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
</script>

<template>
  <div class="special-input">
    <BalTextInput
      :modelValue="modelValue"
      v-bind="$attrs"
      class="mb-3"
      size="auto"
      type="number"
      name="poolName"
      inputAlignRight
      @input="val => emit('update:modelValue', val)"
    >
      <template #prepend>
        <div class="flex gap-3">
          <BalAssetSet
            :logoURIs="orderedTokenURIs(pool)"
            class="flex-shrink-0"
            :width="100"
            :size="32"
          />
          <div class="flex flex-col">
            <div class="flex flex-row flex-wrap">
              <span
                v-for="(token, i) in pool.tokens"
                :key="token.address"
                class="flex-shrink-0"
              >
                {{
                  !!Number(token.weight)
                    ? `${Number(token.weight) * 100}%`
                    : '100%'
                }}
                {{ token.symbol
                }}<template v-if="i !== pool.tokens.length - 1"
                  >,&nbsp;</template
                >
              </span>
            </div>
            <div class="text-sm">
              {{ pool.symbol }}
            </div>
          </div>
        </div>
      </template>
      <template #append>
        <div class="flex items-center px-2 h-full">
          <span class="text-xl text-black dark:text-white">%</span>
        </div>
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
