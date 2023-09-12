<script setup lang="ts">
import MultiVoting from '@/components/contextual/pages/vebal/MultiVoting/MultiVoting.vue';
import { provideVoting } from '@/components/contextual/pages/vebal/providers/voting.provider';
import { isFakeModal } from '@/composables/useFakeModal';

provideVoting();
isFakeModal.value = true;
onBeforeUnmount(() => (isFakeModal.value = false));
</script>

<template>
  <MultiVoting />
</template>

