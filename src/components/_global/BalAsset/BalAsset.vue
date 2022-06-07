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
  <Avatar v-else-if="!!address" :address="address" :size="size" />
  <div
    v-else
    class="rounded-full inline-block leading-none shadow-sm overflow-visible"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: `${noIconColor} !important`
    }"
  />
</template>

<script>
import { computed, defineComponent, ref, toRefs, watch } from 'vue';

import useDarkMode from '@/composables/useDarkMode';
import useTailwind from '@/composables/useTailwind';
import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';

import Avatar from '../../images/Avatar.vue';

export default defineComponent({
  name: 'BalAsset',

  components: {
    Avatar
  },

  props: {
    address: {
      type: String
    },
    iconURI: { type: String },
    size: {
      type: Number,
      default: 24
    }
  },
  setup(props) {
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
    const iconSRC = computed(() => {
      if (props.iconURI) return resolve(props.iconURI);

      const token = getToken(address.value);
      if (!token) return '';
      return resolve(token.logoURI);
    });

    const noIconColor = computed(() =>
      darkMode.value ? theme.colors.gray['700'] : theme.colors.gray['300']
    );

    /**
     * WATCHERS
     */
    watch(iconSRC, newURL => {
      if (newURL !== '') error.value = false;
    });

    return {
      iconSRC,
      error,
      noIconColor
    };
  }
});
</script>
