<script setup lang="ts">
type Props = {
  isVisible: boolean;
};

withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);
</script>

<template>
  <BalModal
    :show="isVisible"
    :title="$t('crossChainBoost.syncModal.title')"
    @close="emit('closeModal')"
  >
    <div>{{ $t('crossChainBoost.syncModal.description') }}</div>
  </BalModal>
</template>