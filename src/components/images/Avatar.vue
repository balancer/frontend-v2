<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import useUrls from '@/composables/useUrls';

/**
 * TYPES
 */
type Props = {
  address: string;
  iconURI?: string;
  size?: number;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  iconURI: '',
  size: 24
});

/**
 * COMPOSABLES
 */
const { resolve } = useUrls();

/**
 * STATE
 */
const error = ref(false);
const isMounted = ref(false);

/**
 * COMPUTED
 */
const iconSRC = computed(() => resolve(props.iconURI));

/**
 * WATCHERS
 */
watch(iconSRC, newURL => {
  if (newURL !== '') error.value = false;
});

/**
 * LIFECYCLE
 */
onMounted(() => (isMounted.value = true));
</script>

<template>
  <img
    v-if="iconSRC && !error"
    :src="iconSRC"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: 'white'
    }"
    @error="error = true"
    class="rounded-full inline-block leading-none shadow-sm"
  />
  <div
    v-else
    class="leading-none rounded-full overflow-hidden"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <Jazzicon v-if="isMounted" :address="address" :diameter="size" />
  </div>
</template>
