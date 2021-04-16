<template>
  <div class="bal-loading-block shimmer" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalLoadingBlock'
});
</script>

<style>
.bal-loading-block {
  @apply rounded-lg;
  min-height: 5px;
}

@keyframes shimmerBackground {
  0% {
    background-position: -5000px 0;
  }
  100% {
    background-position: 5000px 0;
  }
}

.shimmer {
  --startColor: theme('colors.gray.100');
  --midColor: theme('colors.gray.200');
  --endColor: theme('colors.gray.100');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}
</style>
