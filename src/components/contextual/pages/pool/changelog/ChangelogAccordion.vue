<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (event: 'toggle'): void;
}>();

function start(el: HTMLDivElement) {
  el.style.height = el.scrollHeight + 'px';
}

function end(el: HTMLDivElement) {
  el.style.height = '';
}
</script>

<template>
  <div class="accordion">
    <div class="accordion__trigger" @click="$emit('toggle')">
      <slot name="accordion-trigger"></slot>
    </div>

    <transition
      name="accordion"
      @enter="start"
      @after-enter="end"
      @before-leave="start"
      @after-leave="end"
    >
      <div v-show="isOpen" class="accordion__content">
        <slot name="accordion-content"></slot>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.accordion {
  position: relative;
  margin: 0;
  padding: 0;
}

.accordion__item {
  cursor: pointer;
  padding: 10px 20px 10px 40px;
  border-bottom: 1px solid #ebebeb;
  position: relative;
}

.accordion-enter-active,
.accordion-leave-active {
  will-change: height, opacity;
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from {
  opacity: 0;
  height: 0;
}

.accordion-enter,
.accordion-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>