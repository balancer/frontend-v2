<template>
  <span class="inline-block v-align-middle leading-none">
    <img
      v-if="logo && !error"
      :src="_url(logo)"
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
import { defineComponent, toRefs, ref, computed } from 'vue';
import { useStore } from 'vuex';
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
    const { address } = toRefs(props);

    const store = useStore();

    const tokens = computed(() =>
      store.getters['registry/getTokens']({ includeEther: true })
    );

    const error = ref(false);

    const logo = computed(() => {
      const token = tokens.value[address.value];
      if (!token) {
        return '';
      }
      return token.logoURI;
    });

    return {
      logo,
      error
    };
  }
});
</script>
