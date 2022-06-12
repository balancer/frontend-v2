<template>
  <component
    class="bal-asset rounded-full inline-block leading-none shadow-sm"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
    :is="rootElement"
    v-bind="rootElementAttrs"
  >
    <img
      v-if="iconSRC && !error"
      :src="iconSRC"
      :style="{
        background: 'white'
      }"
      @error="error = true"
      class="rounded-full"
    />
    <Avatar v-else-if="!!address" :address="address" :size="size" />
    <div
      v-else
      class="rounded-full overflow-visible"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        background: `${noIconColor} !important`
      }"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';

import useDarkMode from '@/composables/useDarkMode';
import useTailwind from '@/composables/useTailwind';
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
  size: 24,
  button: false
});

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { resolve } = useUrls();
const { theme } = useTailwind();
const { darkMode } = useDarkMode();

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
  'aria-label': token.value?.symbol
}));

const noIconColor = computed(() =>
  darkMode.value ? theme.colors.gray['700'] : theme.colors.gray['300']
);

/**
 * WATCHERS
 */
watch(iconSRC, newURL => {
  if (newURL !== '') error.value = false;
});
</script>

<style scoped>
button.bal-asset {
  @apply transition-transform border-0 shadow;
}

button.bal-asset:hover,
button.bal-asset:focus {
  @apply scale-110 transform-gpu;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
