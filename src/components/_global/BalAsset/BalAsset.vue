<script setup lang="ts">
import { useTokens } from '@/providers/tokens.provider';
import useUrls from '@/composables/useUrls';
import { TokenInfo } from '@/types/TokenList';

import Avatar from '../../images/Avatar.vue';

type Props = {
  address?: string;
  iconURI?: string;
  size?: number;
  button?: boolean;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  address: '',
  iconURI: '',
  size: 24,
  button: false,
  disabled: false,
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
  disabled: props.disabled,
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
    :title="token?.symbol"
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

button:disabled.bal-asset {
  @apply opacity-20 cursor-not-allowed;
}

button:not([disabled]).bal-asset:hover,
button:not([disabled]).bal-asset:focus {
  @apply scale-110 transform-gpu;

  box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
}
</style>
