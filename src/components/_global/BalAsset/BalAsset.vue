<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';

import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';
import { TokenInfo } from '@/types/TokenList';

import Avatar from '../../images/Avatar.vue';

type Props = {
  address?: string;
  iconURI?: string;
  size?: number;
  button?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  address: '',
  iconURI: '',
  size: 24,
  button: false,
});

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { resolve } = useUrls();

/**
 * STATE
 */
const { address } = toRefs(props);
const error = ref(false);

/**
 * COMPUTED
 */
const token = computed<TokenInfo | undefined>(() => getToken(address.value));

const iconSRC = computed(() => {
  if (props.iconURI) return resolve(props.iconURI);

  if (!token.value?.logoURI) return '';
  return resolve(token.value.logoURI);
});

const rootElement = computed(() => (props.button ? 'button' : 'div'));

const rootElementAttrs = computed(() => ({
  'aria-label': token.value?.symbol,
}));

/**
 * WATCHERS
 */
watch(iconSRC, newURL => {
  if (newURL !== '') error.value = false;
});
</script>

<template>
  <component
    :is="rootElement"
    class="inline-block leading-none rounded-full shadow-sm bal-asset"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
    v-bind="rootElementAttrs"
  >
    <img
      v-if="iconSRC && !error"
      :src="iconSRC"
      class="bg-white rounded-full"
      @error="error = true"
    />
    <Avatar v-else-if="!!address" :address="address" :size="size" />
    <div
      v-else
      class="overflow-visible bg-gray-300 dark:bg-gray-700 rounded-full"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
      }"
    />
  </component>
</template>

<style scoped>
button.bal-asset {
  @apply transition-transform shadow;
}

button.bal-asset:hover,
button.bal-asset:focus {
  @apply scale-110 transform-gpu;

  box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
}
</style>
