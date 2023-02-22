<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="data">
    <img :src="data.image" alt="image" />
    <h1>{{ data.name }}</h1>
    <div>Status: {{ data.status }}</div>
    <div>Species: {{ data.species }}</div>
    <div>Origin: {{ data.origin.name }}</div>
    <div>Location: {{ data.location.name }}</div>
    <br />
    <button @click="refetch()">Refetch</button>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { getCharacter } from './characterData';

const props = defineProps<{
  characterId: string;
}>();

const { data, isLoading, refetch } = useQuery(
  ['characters', props.characterId],
  () => getCharacter(props.characterId)
);
</script>
