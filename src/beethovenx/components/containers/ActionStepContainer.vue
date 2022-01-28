<script setup lang="ts">
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';

type Props = {
  stepNumber: string;
  complete: boolean;
  headline: string;
  subHeadline?: string;
  buttonText: string;
  buttonTextLoading: string;
  loading: boolean;
  disabled: boolean;
};

const emit = defineEmits<{
  (e: 'buttonClick'): void;
}>();

const props = defineProps<Props>();
</script>

<template>
  <div class="action-step-container">
    <div class="action-step-inner">
      <div class="action-step text-green-500">
        <BalIcon v-if="props.complete" name="check" class="text-green-500" />
        <span v-else class="text-gray-500 dark:text-gray-400">
          {{ props.stepNumber }}
        </span>
      </div>
      <div class="ml-3 flex-1">
        <div>{{ props.headline }}</div>
        <div v-if="props.subHeadline" class="text-gray-400">
          {{ props.subHeadline }}
        </div>
      </div>
      <BalBtn
        v-if="!props.complete"
        @click="emit('buttonClick')"
        :disabled="props.disabled"
        size="sm"
        :loading="props.loading"
        :loading-label="props.buttonTextLoading"
      >
        <div class="w-28">
          {{ props.buttonText }}
        </div>
      </BalBtn>
      <div v-if="props.complete">
        <slot name="completeContent" />
      </div>
    </div>
    <slot name="underContent" />
  </div>
</template>

<style scoped>
.action-step-container {
  @apply p-3 border rounded-lg dark:border-gray-800;
}
.action-step-inner {
  @apply flex items-center;
}
.action-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
