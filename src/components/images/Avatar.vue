<template>
  <div
    class="leading-none rounded-full overflow-hidden"
    :style="{
      width: `${parseInt(size) || 22}px`,
      height: `${parseInt(size) || 22}px`
    }"
  >
    <jazzicon :address="address" :diameter="parseInt(size) || 22" />
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
