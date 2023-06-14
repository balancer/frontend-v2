<script lang="ts" setup>
import { Risk } from '@/composables/usePoolRisks';

interface Props {
  risks: Risk[];
}

defineProps<Props>();
</script>

<template>
  <ul class="px-8 lg:px-4 list-disc">
    <li v-for="{ title, hash } in risks" :key="hash" class="mb-1 link">
      <router-link :to="{ name: 'risks', hash }">{{ title }}</router-link>
    </li>
  </ul>
</template>
