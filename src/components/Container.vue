<template>
  <div :class="slim ? 'px-0 md:px-6' : 'px-6'" class="container mx-auto">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    slim: Boolean
  }
};
</script>
