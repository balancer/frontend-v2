<template>
  <div
    class="relative p-3 overflow-hidden rounded bg-white dark:bg-gray-800 shadow-lg text-sm dark:text-white dark:border-gray-850 w-64"
  >
    <div class="justify-between group">
      <BalLink
        v-if="notification.transactionMetadata"
        :href="notification.transactionMetadata.explorerLink"
        external
        noStyle
      >
        <div class="font-semibold flex items-center mb-1">
          <span class="title">{{ notification.title }}</span>
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-1 text-gray-400 dark:text-gray-600 group-hover:text-pink-500 transition-colors"
          />
        </div>
        <div class="message">{{ notification.message }}</div>
      </BalLink>
      <div v-else>
        <div class="font-semibold title mb-1">
          {{ notification.title }}
        </div>
        <div class="message">{{ notification.message }}</div>
      </div>
      <BalCloseIcon
        class="cursor-pointer text-black dark:text-white flex-shrink-0 absolute top-3 right-2"
        @click="closeNotification()"
      />
    </div>
    <div
      :class="progressClasses"
      :style="{ width: `${(progress * 100).toFixed(0)}%` }"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref
} from 'vue';
import { TransitionPresets, useTransition } from '@vueuse/core';

import useNotifications, { Notification } from '@/composables/useNotifications';

export default defineComponent({
  name: 'Notification',

  props: {
    notification: {
      type: Object as PropType<Notification>,
      required: true
    }
  },

  setup(props) {
    // COMPOSABLES
    const totalProgress = ref(1);

    const progress = useTransition(totalProgress, {
      duration: props.notification.autoCloseAfterMs,
      transition: TransitionPresets.linear
    });

    let notificationTimeout: NodeJS.Timeout;

    const { notifications, removeNotification } = useNotifications();

    // METHODS
    function closeNotification() {
      removeNotification(props.notification.id);
    }

    onMounted(() => {
      totalProgress.value = 0;

      if (props.notification.autoCloseAfterMs) {
        notificationTimeout = setTimeout(() => {
          closeNotification();
        }, props.notification.autoCloseAfterMs);
      }
    });

    onUnmounted(() => {
      if (notificationTimeout != null) {
        clearTimeout(notificationTimeout);
      }
    });

    // COMPUTED
    const progressClasses = computed(() => {
      let bgClasses = 'bg-yellow-600 dark:bg-yellow-500';

      if (props.notification.type === 'success') {
        bgClasses = 'bg-green-500 dark:bg-green-500';
      } else if (props.notification.type === 'error') {
        bgClasses = 'bg-red-500 dark:bg-red-500';
      }

      return `
          progress-bar absolute bottom-0 left-0 opacity-80 w-0 transition duration-300 ease-linear h-1 ${bgClasses}
        `;
    });

    return {
      // methods
      closeNotification,

      // computed
      notifications,
      progressClasses,
      progress
    };
  }
});
</script>
<style scoped>
.title {
  @apply lowercase;
}
.title::first-letter {
  @apply uppercase;
}
.message {
  @apply overflow-hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.progress-bar {
  transition: width 0.3s;
}
</style>
