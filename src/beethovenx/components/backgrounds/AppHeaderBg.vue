<template>
  <div class="app-header-bg ">
    <div class="w-full max-w-3xl"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppHeaderBg',

  setup() {
    return {};
  }
});
</script>

<style>
.app-header-bg {
  position: absolute;
  width: 100%;
  height: 350px;
  @apply bg-cover bg-center;
  transition: all 0.3s ease-in-out;
  background-image: url('/images/backgrounds/banner-medium.svg');
}
</style>
