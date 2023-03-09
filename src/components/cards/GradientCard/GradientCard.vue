<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  imgUrls: string[];
};

/**
 * PROPS
 */
const props = defineProps<Props>();

const bgImageStyles = computed(() => {
  const bgStyle = props.imgUrls
    .map(imgUrl => `bg-[url('${imgUrl}')]`)
    .join(' ');
  return {
    [bgStyle]: true,
  };
});
</script>

<template>
  <BalCard
    shadow="2xl"
    noPad
    :class="['rounded-xl', bgImageStyles]"
    growContent
  >
    <slot></slot>
  </BalCard>
</template>