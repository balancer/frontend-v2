<template>
  <span class="inline-block v-align-middle leading-none">
    <img
      v-if="iconURL && !error"
      :src="_url(iconURL)"
      :style="{
        width: `${size}px`,
        height: `${size}px`
      }"
      @error="error = true"
      class="rounded-full inline-block bg-white leading-none shadow-sm"
    />
    <Avatar v-else :address="address" :size="size" />
  </span>
</template>

<script>
import { defineComponent, toRefs, ref, computed, watch } from 'vue';
import useTokens from '@/composables/useTokens';
import Avatar from '../../images/Avatar.vue';

export default defineComponent({
  name: 'BalAsset',

  components: {
    Avatar
  },

  props: {
    address: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 24
    }
  },

  setup(props) {
    // COMPOSABLES
    const { allTokensIncludeEth } = useTokens();

    // DATA
    const { address } = toRefs(props);
    const error = ref(false);

    // COMPUTED
    const iconURL = computed(() => {
      const token = allTokensIncludeEth.value[address.value];
      if (!token) return '';
      return token.logoURI;
    });

    watch(iconURL, newURL => {
      if (newURL !== '') error.value = false;
    });

    return {
      iconURL,
      error
    };
  }
});
</script>
