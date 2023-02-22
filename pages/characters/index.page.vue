<template>
  <div>
    <h1>Rick and Morty Characters</h1>
    <button :disabled="isFetching" @click="refetch()">
      {{ isFetching ? 'Refetching...' : 'Refetch' }}
    </button>
    <div v-if="isLoading">loading...</div>
    <div v-else>
      <ul>
        <li v-for="char in characters" :key="char.id">
          <a :href="`/characters/${char.id}`"
            >{{ char.name }} - {{ char.status }}</a
          >
        </li>
      </ul>
    </div>
    <button v-show="hasNextPage" @click="fetchNextPage()">
      {{ isFetchingNextPage ? 'Fetching next page...' : 'Fetch next page' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { getCharacters, initialPage } from './characterData';
import type { APIResponse, Character } from './types';

// initialData prop comes from pageProps in index.page.server.ts
const props = defineProps<{
  initialData: APIResponse;
}>();

const {
  data,
  isLoading,
  refetch,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
} = useInfiniteQuery(
  ['characters'],
  ({ pageParam }) => getCharacters(pageParam),
  {
    initialData: {
      pages: [props.initialData], // set our initial data from pageProps
      pageParams: [initialPage],
    },
    getNextPageParam: lastPage => {
      const nextUrl = lastPage.info.next;
      if (nextUrl) {
        // Return next page number
        return Number(nextUrl.charAt(nextUrl.length - 1));
      }
      // Return false means no next page
      return false;
    },
  }
);

const characters = computed<Character[]>(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return data
    .value!.pages.flat()
    .map(char => {
      return char.results;
    })
    .flat();
});
</script>
