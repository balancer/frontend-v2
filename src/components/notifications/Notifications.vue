<template>
  <div class="fixed bottom-2 left-2 z-50 px-4">
    <transition-group name="slide">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        class="mt-2"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import useNotifications from '@/composables/useNotifications';

import Notification from './Notification.vue';

export default defineComponent({
  name: 'Notifications',

  components: {
    Notification,
  },

  setup() {
    // COMPOSABLES
    const { notifications } = useNotifications();

    return {
      // computed
      notifications,
    };
  },
});
</script>
<style scoped>
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-300px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 1s cubic-bezier(0.5, 0, 0.54, 1.42);
}

.slide-move {
  transition: all 0.3s ease;
}
</style>
