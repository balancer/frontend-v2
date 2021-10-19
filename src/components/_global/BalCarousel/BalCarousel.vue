<script setup lang="ts">
import { onMounted } from 'vue';
import Swiper from 'swiper';
import SwiperCore, { Pagination } from 'swiper/core';
import 'swiper/swiper-bundle.css';

type Props = { height: string };
defineProps<Props>();

// modules styles
import 'swiper/components/pagination/pagination.min.css';
SwiperCore.use([Pagination]);

onMounted(() => {
  new Swiper('.swiper-container', {
    direction: 'horizontal',
    loop: false,
    slidesPerView: 1,
    spaceBetween: -5,

    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
      renderBullet: (index, className) => {
        return `<span class="${className} bal-bullet"></span>`;
      }
    }
  });
});
</script>

<template>
  <div class="p-4">
    <div :class="`swiper-container h-${height}`">
      <div class="swiper-wrapper h-full">
        <div
          class="swiper-slide h-full pr-4"
          v-for="(child, i) in $slots.default()"
          :key="`slide-${i}`"
        >
          <component :is="child" />
        </div>
      </div>
    </div>
    <div class="swiper-pagination" />
  </div>
</template>

<style scoped>
.swiper-container {
  @apply w-full;
}
.swiper-pagination {
  @apply relative;
  @apply mt-3;
}
</style>
<style>
.bal-bullet {
  @apply bg-gradient-to-tr;
  @apply from-yellow-400;
  @apply to-pink-500;
  @apply mr-3;
  width: 10px;
  height: 10px;
}
</style>
