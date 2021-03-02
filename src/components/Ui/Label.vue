<template>
  <span class="Label border v-align-middle bg-primary-500 border-primary-500">
    <slot />
  </span>
</template>

<style scoped lang="css">
.Label {
  display: inline-block;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 500;
  height: 22px;
  line-height: 23px;
  border-radius: 2em;
  box-shadow: none;
  color: var(--text-color);
}

.active {
  color: white;
}
</style>
