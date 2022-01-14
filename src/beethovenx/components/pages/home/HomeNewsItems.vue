<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import useNumbers from '@/composables/useNumbers';
import { useRouter } from 'vue-router';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

const { fNum } = useNumbers();
const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();
const router = useRouter();

function handleCardClick() {
  //router.push({ name: 'pool', params: { id: pool.id } });
}
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    v-if="!beethovenxConfigLoading"
  >
    <a
      v-for="(newsItem, i) in beethovenxConfig.homeNewsItems"
      :key="i"
      :href="newsItem.url"
      class="block flex"
      target="_blank"
    >
      <BalCard :img-src="newsItem.image" class="flex-1">
        <div class="text-xl font-medium">
          {{ newsItem.title }}
        </div>
        <div class="mt-2 mb-6 flex-1 whitespace-pre-line">
          {{ newsItem.description }}
        </div>
        <template v-slot:footer>
          <div class="flex w-full">
            <div class="flex-1">{{ newsItem.publishDate }}</div>
            <a
              :href="newsItem.url"
              target="_blank"
              class="underline text-green-500"
            >
              Read more
            </a>
          </div>
        </template>
      </BalCard>
    </a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" v-else>
    <BalLoadingBlock v-for="n in 4" :key="n" class="h-96" />
  </div>
</template>
