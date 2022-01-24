<template>
  <div class="bal-blank-slate">
    <slot v-text="$t('noContent')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalBlankSlate'
});
</script>

<style>
.bal-blank-slate {
  @apply border dark:border-gray-700 border-dashed p-8 flex flex-col items-center justify-center text-gray-500 rounded-lg;
  min-height: 5px;
}
</style>
