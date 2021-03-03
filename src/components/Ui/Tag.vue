<template>
  <span class="Tag v-align-middle">
    <slot />
  </span>
</template>

<style scoped lang="css">
.Tag {
  @apply text-gray-300 bg-gray-700;
  display: inline-block;
  border-radius: 13px;
  height: 27px;
  line-height: 20px;
  padding: 5px 9px;
}
</style>
