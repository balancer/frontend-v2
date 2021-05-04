<template>
  <div>
    <div class="flex items-center">
      <BalBtn color="black" darkOutline @click="onClick" class="mr-2">
        <BalIcon name="search" size="sm" class="mr-2" />
        Filter tokens
      </BalBtn>
      <BalChip
        v-for="token in modelValue"
        class="mr-2"
        :key="token"
        size="lg"
        color="white"
        iconSize="sm"
        :closeable="true"
        @closed="removeToken(token)"
      >
        <BalAsset :address="token" :size="20" class="flex-auto" />
        <span class="ml-2">{{ allTokens[token].symbol }}</span>
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
      console.log('lmao', newSelected);
      emit('update:modelValue', newSelected);
    }

    function removeToken(token: string) {
      const newSelected = props.modelValue.filter(t => t !== token);
      console.log('lmao', newSelected);
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
