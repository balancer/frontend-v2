<script setup lang="ts">
import { ref, computed } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  modelValue: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/**
 * STATE
 */
const openTokenModal = ref(false);

/**
 * COMPOSABLEs
 */
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!props.modelValue);

const token = computed(() => {
  if (!hasToken.value) return {};
  return getToken(props.modelValue);
});

/**
 * METHODS
 */
const toggleModal = () => (openTokenModal.value = !openTokenModal.value);
</script>

<template>
  <div>
    <div
      v-if="hasToken"
      class="token-select-input selected group"
      @click="toggleModal"
    >
      <BalAsset :address="token.address" class="shadow mr-2" />
      {{ token.symbol }}
      <BalIcon
        name="chevron-down"
        size="sm"
        class="ml-2 text-blue-500 group-hover:text-pink-500"
      />
    </div>
    <div v-else class="token-select-input unselected" @click="toggleModal">
      {{ $t('selectToken') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </div>

    <teleport to="#modal">
      <SelectTokenModal
        v-if="openTokenModal"
        :excluded-tokens="[modelValue]"
        @close="openTokenModal = false"
        @select="emit('update:modelValue', $event)"
      />
    </teleport>
  </div>
</template>

<style scoped>
.token-select-input {
  @apply rounded-lg flex items-center p-2 cursor-pointer;
  @apply text-sm font-bold;
  @apply shadow-xl hover:shadow-none transition-shadow;
}

.unselected {
  @apply bg-blue-500 text-white;
}

.selected {
  @apply bg-white dark:bg-gray-800 border dark:border-gray-700 text-black dark:text-white;
}
</style>
