<script setup lang="ts">
const props = defineProps({
  s: {
    type: String,
    required: true,
  },
  hue: {
    type: String,
    required: false,
    default: '0',
  },
});
</script>

<template>
  <span class="help-step">
    {{ props.s }}
  </span>
</template>

<style scoped>
.help-step {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: -2px;
  margin-right: 3px;
  border-radius: 10px;
  background-color: hsl(v-bind('props.hue') 50% 45%);
  color: white;
  font-weight: bold;
  font-size: 0.7em;
  vertical-align: middle;
  line-height: 0;
}
</style>
