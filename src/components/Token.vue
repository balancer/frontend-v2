<template>
  <span class="d-inline-block v-align-middle line-height-0">
    <img
      v-if="!error"
      :src="_url(url)"
      :style="{
        width: `${size || 22}px`,
        height: `${size || 22}px`
      }"
      @error="error = true"
      class="circle border line-height-0"
    />
    <Avatar v-else :address="address" :size="size" />
  </span>
</template>

<script>
export default {
  props: {
    url: String,
    address: String,
    size: Number
  },
  data() {
    return {
      error: false
    };
  }
};
</script>
