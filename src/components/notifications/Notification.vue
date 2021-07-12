<template>
  <div class="relative p-3 border rounded bg-white shadow-lg text-sm">
    <div class="flex justify-between">
      <BalLink
        v-if="notification.transactionMetadata"
        :href="notification.transactionMetadata.explorerLink"
        external
        noStyle
      >
        <div v-if="notification.title" class="font-semibold">
          {{ notification.title }}
        </div>
        <div>{{ notification.message }}</div>
      </BalLink>
      <div v-else>
        <div v-if="notification.title" class="font-semibold">
          {{ notification.title }}
        </div>
        <div>{{ notification.message }}</div>
      </div>
      <BalCloseIcon class="cursor-pointer" @click="closeNotification()" />
    </div>
    <div
      class="progress"
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
<style scoped>
.progress {
  width: 0%;
  height: 4px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: black;
  opacity: 0.8;
  transition: width 1s linear;
}
</style>
