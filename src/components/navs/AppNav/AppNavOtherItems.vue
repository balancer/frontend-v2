<template>
  <BalPopover align="left">
    <template v-slot:activator>
      <div
        class="flex items-center px-4 cursor-pointer relative"
        style="top: -10px"
      >
        <div class="text-4xl">...</div>
      </div>
    </template>
    <div class="w-48">
      <div
        v-for="(link, index) in EXTERNAL_LINKS.Beethoven.NavOtherItems"
        :key="index"
        class="app-nav-other-item"
      >
        <BalLink :href="link.url" external noStyle>
          {{ link.title }}
          <BalIcon name="arrow-up-right" size="sm" class="text-gray-500" />
          <div v-if="link.subTitle" class="text-xs text-gray-400">
            {{ link.subTitle }}
          </div>
        </BalLink>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Alert } from '@/composables/useAlerts';
import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  name: 'AppNavOtherItems',

  props: {
    alert: { type: Object as PropType<Alert>, required: true }
  },

  setup() {
    return {
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>

<style scoped>
.app-nav-other-item {
  @apply px-4 py-2 text-gray-300 hover:text-green-500 block hover:bg-gray-700;
}
</style>
