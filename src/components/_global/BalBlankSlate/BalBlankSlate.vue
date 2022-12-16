<template>
  <div class="bal-blank-slate text-secondary">
    <slot v-text="$t('noContent')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalBlankSlate',
});
</script>

<style>
.bal-blank-slate {
  @apply border dark:border-gray-700 border-dashed p-6 flex flex-col items-start justify-center rounded-lg;

  min-height: 5px;
}
</style>
