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
    <jazzicon :address="address" :diameter="size" />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import useUrls from '@/composables/useUrls';

export default defineComponent({
  name: 'Avatar',

  components: {
    Jazzicon
  },

  props: {
    address: {
      type: String,
      required: true
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
    const { resolve } = useUrls();

    /**
     * STATE
     */
    const error = ref(false);

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

    return {
      iconSRC,
      error
    };
  }
});
</script>
