<template>
  <div class="fixed bottom-0 left-0 w-full px-2 mb-4 z-20">
    <div class="w-full py-2 mx-auto rounded-full bg-white dark:bg-gray-800 shadow-xl flex justify-between items-center">
      <div class="w-1/3 pl-2">
        <DarkModeToggle circle />
      </div>
      <div class="w-1/3 flex justify-center">
        <AppNavToggle darkModeBg="700" />
      </div>
      <div class="w-1/3" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppNavToggle from '@/components/navs/AppNav/AppNavToggle.vue';
import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';

export default defineComponent({
  name: 'AppFooterNav',

  components: {
    AppNavToggle,
    DarkModeToggle
  }
});
</script>
