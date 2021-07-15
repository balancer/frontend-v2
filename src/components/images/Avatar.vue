<template>
  <div>
    <img
      v-if="profile?.image"
      :src="_ipfsUrl(profile.image)"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
      @error="error = true"
      class="rounded-full leading-none"
    />
    <div
      v-else
      class="leading-none rounded-full overflow-hidden"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
    >
      <jazzicon :address="address" :diameter="parseInt(size) || 22" />
    </div>
  </div>
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
