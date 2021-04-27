<template>
  <div>
    <div
      :class="[
        'border rounded-lg flex items-center h-12 px-4 mb-4 text-gray-500',
        loading ? 'bg-gray-50' : 'bg-white'
      ]"
      @click.prevent="onClick"
    >
      <BalIcon name="search" size="sm" class="mr-4" />
      <span v-if="modelValue.length === 0">{{ $t('searchBy') }}</span>
      <BalChip
        v-else
        v-for="token in modelValue"
        class="mr-2"
        :key="token"
        size="md"
        color="gray"
        :closeable="true"
        @closed="removeToken(token)"
        @click.stop
      >
        <BalAsset :address="token" :size="20" class="flex-auto" />
        <span class="ml-1">{{ allTokens[token].symbol }}</span>
      </BalChip>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        :open="selectTokenModal"
        :excluded-tokens="modelValue"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  name: 'TokenSearchInput',

  components: {
    SelectTokenModal
  },

  emits: ['update:modelValue'],

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    loading: { type: Boolean, default: true }
  },

  setup(props, { emit }) {
    // COMPOSABLES
    const { allTokens } = useTokens();

    // DATA
    const selectTokenModal = ref(false);

    // METHODS
    function addToken(token: string) {
      const newSelected = [...props.modelValue, token];
      emit('update:modelValue', newSelected);
    }

    function removeToken(token: string) {
      const newSelected = props.modelValue.filter(t => t !== token);
      emit('update:modelValue', newSelected);
    }

    function onClick() {
      if (!props.loading) selectTokenModal.value = true;
    }

    return {
      // data
      selectTokenModal,
      // computed
      allTokens,
      // methods
      addToken,
      removeToken,
      onClick
    };
  }
});
</script>
