<template>
  <span class="Tag v-align-middle">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.Tag {
  display: inline-block;
  border-radius: 13px;
  height: 27px;
  line-height: 20px;
  padding: 5px 9px;
  color: var(--bg-color);
  background-color: var(--text-color);
}
</style>
