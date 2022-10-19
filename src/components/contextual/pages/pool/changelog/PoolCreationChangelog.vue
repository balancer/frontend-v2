<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  poolCreation: any;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

props;
</script>

<template>
  <div>
    <div class="text-lg text-semibold">
      {{ $t('changelog.poolCreation.attributes') }}
    </div>
  </div>
</template>

