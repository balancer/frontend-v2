<template>
  <BalModal show @close="onClose">
    <div class="-mx-4 p-4 items-center">
      <div class="mx-2">
        <img src="~@/beethovenx/assets/images/ludwig-says-2.svg" />
      </div>
      <BalBtn
        class="mt-8"
        label="Compose my pool"
        block
        @click.prevent="create"
      />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['create', 'close'],
  props: {},
  setup(props, { emit }) {
    function create() {
      emit('create');
    }

    function onClose() {
      emit('close');
    }

    return {
      onClose,
      create
    };
  }
});
</script>
