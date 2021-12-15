<template>
  <div :class="['app-nav-alert', classes]" @click="handleClick">
    <div class="w-8" />
    <div class="flex-1 text-center flex items-center justify-center">
      <BalIcon v-if="iconName" :name="iconName" size="lg" class="mr-4" />
      <span>{{ alert.label }}</span>
      <BalBtn
        v-if="alert.action && alert.actionLabel"
        class="ml-4 cursor-pointer"
        color="white"
        size="xs"
        :label="alert.actionLabel"
        @click="alert.action"
      />
    </div>
    <div v-if="!alert.persistent" class="w-8">
      <BalIcon name="x" class="cursor-pointer" @click="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
import useAlerts, { Alert, AlertType } from '@/composables/useAlerts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'NavAlert',

  props: {
    alert: { type: Object as PropType<Alert>, required: true }
  },

  setup(props) {
    const { removeAlert } = useAlerts();

    const colorClass = computed(() => {
      switch (props.alert.type) {
        case AlertType.ERROR:
          return 'bg-red-500 text-white';
        case AlertType.FEATURE:
          return 'bg-yellow-300 text-black';
        default:
          return 'bg-black text-white';
      }
    });

    const iconName = computed(() => {
      switch (props.alert.type) {
        case AlertType.ERROR:
          return 'alert-triangle';
        default:
          return null;
      }
    });

    const classes = computed(() => {
      return {
        [colorClass.value]: true,
        'cursor-pointer': props.alert.actionOnClick
      };
    });

    function handleClose() {
      removeAlert(props.alert.id);
    }

    function handleClick() {
      if (props.alert.actionOnClick && props.alert.action) {
        props.alert.action();
      }
    }

    return { classes, iconName, handleClose, handleClick };
  }
});
</script>

<style>
.app-nav-alert {
  @apply flex items-center justify-between py-4 px-6;
}
</style>
