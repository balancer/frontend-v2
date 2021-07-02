<template>
  <span>
    <img
      v-if="profile?.image"
      :src="_ipfsUrl(profile.image)"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`,
        verticalAlign: 'middle'
      }"
      @error="error = true"
      class="rounded-full leading-none"
    />
    <jazzicon
      v-else
      :address="address"
      :diameter="parseInt(size) || 22"
      class="leading-none inline-block align-middle"
    />
  </span>
</template>

<script>
import Jazzicon from 'vue3-jazzicon/src/components';

export default {
  components: {
    Jazzicon
  },

  props: ['address', 'size', 'profile']
};
</script>
