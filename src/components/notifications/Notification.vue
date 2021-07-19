<template>
  <div
    class="relative p-3 border rounded bg-white dark:bg-gray-800 shadow-lg text-sm dark:text-white dark:border-gray-850"
  >
    <div class="flex justify-between group">
      <BalLink
        v-if="notification.transactionMetadata"
        :href="notification.transactionMetadata.explorerLink"
        external
        noStyle
      >
        <div v-if="notification.title" class="font-semibold flex items-center">
          {{ notification.title }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-1 text-gray-400 dark:text-gray-600 group-hover:text-pink-500 transition-colors"
          />
        </div>
        <div>{{ notification.message }}</div>
      </BalLink>
      <div v-else>
        <div v-if="notification.title" class="font-semibold">
          {{ notification.title }}
        </div>
        <div>{{ notification.message }}</div>
      </div>
      <BalCloseIcon
        class="cursor-pointer text-black dark:text-white"
        @click="closeNotification()"
      />
    </div>
    <div
      class="absolute bottom-0 left-0 opacity-80 w-0 transition duration-300 ease-linear h-1 bg-yellow-600 dark:bg-yellow-500"
      :style="{ width: `${(progress * 100).toFixed(0)}%` }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue';
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

    return {
      // methods
      closeNotification,

      // computed
      notifications,
      progress
    };
  }
});
</script>
