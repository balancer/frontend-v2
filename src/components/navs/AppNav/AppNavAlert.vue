<template>
  <div :class="['app-nav-alert', classes]">
    <div class="w-8" />
    <div class="flex-1 text-center flex items-center justify-center">
      <BalIcon :name="iconName" class="mr-4" />
      <span>{{ alert.label }}</span>
    </div>
    <div v-if="!alert.persistant" class="w-8">
      <BalIcon name="x" class="cursor-pointer" @click="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { Alert } from '@/store/modules/alerts';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'NavAlert',

  props: {
    alert: { type: Object as PropType<Alert>, required: true }
  },

  setup(props) {
    const store = useStore();

    const colorClass = computed(() => {
      switch (props.alert.type) {
        case 'error':
          return 'bg-red-500 text-white';
        default:
          return 'bg-black text-white';
      }
    });

    const iconName = computed(() => {
      switch (props.alert.type) {
        case 'error':
          return 'alert-triangle';
        default:
          return 'info';
      }
    });

    const classes = computed(() => {
      return {
        [colorClass.value]: true
      };
    });

    function handleClose() {
      store.commit('alerts/setCurrent', null);
    }

    return { classes, iconName, handleClose };
  }
});
</script>

<style>
.app-nav-alert {
  @apply flex items-center justify-between py-4 px-6;
}
</style>
