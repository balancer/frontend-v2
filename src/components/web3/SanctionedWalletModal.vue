<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  isVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close']);

const _isVisible = ref(false);

watch(
  () => props.isVisible,
  () => {
    _isVisible.value = props.isVisible;
  }
);

function onClose() {
  _isVisible.value = false;
  emit('close');
}
</script>

<template>
  <BalModal
    :show="_isVisible"
    title="Your address is blocked from transacting on this site"
    @close="onClose()"
  >
    <p class="pb-3 text-sm">
      Your wallet address cannot use this site because it has been flagged as
      high risk by our compliance partner, TRM Labs.
    </p>
    <p class="pb-3 text-sm">
      This website is open source and permissionless. Anyone can fork and run
      their own front end.
    </p>
  </BalModal>
</template>
