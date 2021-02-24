<template>
  <UiModal
    :open="open"
    @close="$emit('close')"
    @back="
      $emit('back');
      $emit('close');
    "
    :back="true"
  >
    <template v-slot:header>
      <h3 v-text="$t('manageLists')" />
    </template>
    <Search
      v-model="q"
      @input="$emit('inputSearch', q)"
      :placeholder="$t('searchByName')"
      class="p-4 border-b"
    />
    <div>
      <div v-if="Object.keys(tokenlists).length > 0">
        <a v-for="(tokenlist, i) in tokenlists" :key="i" @click="onSelect(i)">
          <RowTokenlist :tokenlist="tokenlist" />
        </a>
      </div>
      <div v-else v-text="$t('errorNoLists')" class="block text-center p-4" />
    </div>
  </UiModal>
</template>

<script>
export default {
  data() {
    return {
      q: ''
    };
  },
  props: {
    open: Boolean,
    tokenlists: Object
  },
  emits: ['back', 'close', 'inputSearch', 'select'],
  methods: {
    onSelect(name) {
      this.$emit('select', name);
    }
  }
};
</script>
