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
      class="rounded-full align-middle inline-block border line-height-0"
    />
    <jazzicon
      v-else
      :address="address"
      :diameter="parseInt(size) || 22"
      class="inline-block align-middle line-height-0"
    />
  </span>
</template>

<script>
export default {
  props: ['address', 'size', 'profile']
};
</script>
