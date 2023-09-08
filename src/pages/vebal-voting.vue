<script setup lang="ts">
import MultiVoting from '@/components/contextual/pages/vebal/LMVoting/MultiVoting.vue';
import { provideVoting } from '@/providers/local/voting.provider';

provideVoting();
</script>

<template>
  <MultiVoting />
</template>

