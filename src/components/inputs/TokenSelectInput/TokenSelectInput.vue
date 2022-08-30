<script setup lang="ts">
import { computed, ref } from 'vue';

import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { isSameAddress } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  modelValue: string;
  fixed?: boolean;
  weight?: number | string;
  excludedTokens?: string[];
  options?: string[];
  disableInjection?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  fixed: false,
  weight: 0,
  excludedTokens: () => [],
  options: () => [],
  disableInjection: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/**
 * STATE
 */
const openTokenModal = ref(false);
const optionTokens = ref<Record<string, TokenInfo>>({});

/**
 * COMPOSABLEs
 */
const { getToken } = useTokens();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!props.modelValue);

const token = computed((): TokenInfo | null => {
  if (!hasToken.value) return null;
  return getToken(props.modelValue);
});

/**
 * METHODS
 */
function toggleModal(): void {
  if (!props.fixed) openTokenModal.value = !openTokenModal.value;
}
</script>

<template>
  <div>
    <div
      v-if="hasToken && options.length === 0"
      :class="['token-select-input selected group', { selectable: !fixed }]"
      @click="toggleModal"
    >
      <div class="w-8">
        <BalAsset :address="token?.address" class="shadow" />
      </div>
      <span class="text-base font-medium">
        {{ token?.symbol }}
      </span>
      <span v-if="Number(weight) > 0" class="ml-2 text-secondary">
        {{
          fNum2(weight, {
            style: 'percent',
            maximumFractionDigits: 0,
          })
        }}
      </span>
      <BalIcon
        v-if="!fixed"
        name="chevron-down"
        size="sm"
        class="ml-2 text-blue-600 group-hover:text-purple-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
      />
    </div>
    <BalDropdown
      v-else-if="hasToken && fixed && options.length > 0"
      :options="options"
      minWidth="40"
      @selected="emit('update:modelValue', $event)"
    >
      <template #activator>
        <div class="group token-select-input selected selectable">
          <div class="w-8">
            <BalAsset :address="token?.address" class="shadow" />
          </div>
          <span class="text-base font-medium">
            {{ token?.symbol }}
          </span>
          <span v-if="Number(weight) > 0" class="ml-2 text-secondary">
            {{
              fNum2(weight, {
                style: 'percent',
                maximumFractionDigits: 0,
              })
            }}
          </span>
          <BalIcon
            name="chevron-down"
            size="sm"
            class="ml-2 text-blue-500 group-hover:text-purple-500 dark:text-blue-400 dark:group-hover:text-purple-400 transition-colors"
          />
        </div>
      </template>
      <template #option="{ option: address }">
        <div
          :set="(optionTokens[address] = getToken(address) || {})"
          class="flex justify-between items-center"
        >
          <div class="flex items-center">
            <BalAsset
              :address="optionTokens[address]?.address"
              class="shadow"
            />
            <span class="ml-1 font-medium">
              {{ optionTokens[address]?.symbol }}
            </span>
          </div>
          <BalIcon
            v-if="isSameAddress(optionTokens[address].address, modelValue)"
            name="check"
            class="ml-4 text-blue-500 dark:text-blue-400"
          />
        </div>
      </template>
    </BalDropdown>

    <div
      v-else
      class="token-select-input unselected selectable"
      @click="toggleModal"
    >
      {{ $t('selectToken') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </div>

    <teleport to="#modal">
      <SelectTokenModal
        v-if="openTokenModal"
        :excludedTokens="[...excludedTokens, modelValue]"
        :includeEther="true"
        :disableInjection="disableInjection"
        @close="openTokenModal = false"
        @select="emit('update:modelValue', $event)"
      />
    </teleport>
  </div>
</template>

<style scoped>
.token-select-input {
  @apply shadow rounded-lg flex items-center h-10 px-2 whitespace-nowrap;
  @apply text-sm;

  font-variation-settings: 'wght' 700;
}

.selectable {
  @apply cursor-pointer hover:shadow-none transition-shadow;
}

.unselected {
  @apply bg-blue-500 dark:bg-blue-400 text-white;
}

.selected {
  @apply bg-gray-50 dark:bg-gray-700 text-black dark:text-white;
}
</style>
