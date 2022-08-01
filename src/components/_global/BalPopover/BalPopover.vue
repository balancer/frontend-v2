<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type PopoverTrigger = 'click' | 'hover';

type Props = {
  trigger?: PopoverTrigger;
  align?: string;
  detached?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  trigger: 'click',
  align: 'right',
  detached: false,
});

const emit = defineEmits<{
  (e: 'show'): void;
  (e: 'hide'): void;
}>();

/**
 * STATE
 */
const popoverOpened = ref(false);
const activatorWrapper = ref<HTMLDivElement>();

/**
 * COMPUTED
 */
const popoverWrapperClasses = computed(() => ({
  'bal-popover-wrapper-visible': popoverOpened.value,
  [`${props.align}-0`]: !props.detached,
  'align-center-transform': props.detached && props.align === 'center',
  'align-right-transform': props.detached && props.align === 'right',
}));

const popoverActivatorWrapperClasses = computed(() => ({
  relative: !props.detached,
}));

const activatorWidth = computed(() => activatorWrapper.value?.clientWidth || 0);

const activatorWidthPx = computed(() => `${activatorWidth.value}px`);

const activatorHalfWidthPx = computed(() => `${activatorWidth.value / 2}px`);

/**
 * METHODS
 */
function togglePopover() {
  popoverOpened.value = !popoverOpened.value;
}

function showPopover() {
  popoverOpened.value = true;
}

function hidePopover() {
  popoverOpened.value = false;
}

function handleClickOutside() {
  if (props.trigger === 'click') {
    hidePopover();
  }
}

/**
 * WATCHERS
 */
watch(popoverOpened, () => {
  if (popoverOpened.value) {
    emit('show');
  } else {
    emit('hide');
  }
});
</script>

<template>
  <div
    v-click-outside="handleClickOutside"
    :class="[popoverActivatorWrapperClasses]"
  >
    <div
      ref="activatorWrapper"
      class="group bal-popover-activator"
      @click="trigger === 'click' && togglePopover()"
      @mouseenter="trigger === 'hover' && showPopover()"
      @mouseleave="trigger === 'hover' && hidePopover()"
    >
      <slot name="activator" />
    </div>
    <div :class="['bal-popover-wrapper', popoverWrapperClasses]">
      <BalCard shadow="lg" v-bind="$attrs" darkBgColor="800">
        <slot :close="hidePopover" />
      </BalCard>
    </div>
  </div>
</template>

<style scoped>
.bal-popover-wrapper {
  @apply invisible opacity-0 absolute z-30 pt-3;

  transition: all 0.2s ease-in-out;
}

.bal-popover-wrapper-visible {
  @apply visible opacity-100;
}

.bal-popover-wrapper:hover {
  @apply visible opacity-100;
}

.align-center-transform {
  transform: translateX(-webkit-calc(-50% + v-bind(activatorHalfWidthPx)));
  transform: translateX(calc(-50% + v-bind(activatorHalfWidthPx)));
}

.align-right-transform {
  transform: translateX(-webkit-calc(-100% + v-bind(activatorWidthPx)));
  transform: translateX(calc(-100% + v-bind(activatorWidthPx)));
}
</style>
