<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="$t('selectToken')" />
    </template>
    <Search
      v-model="q"
      @input="$emit('inputSearch', q)"
      :placeholder="$t('searchBy')"
      class="py-3 px-4 border-b"
    />
    <div
      v-if="tokenlist.tags && Object.keys(tokenlist.tags).length > 0"
      class="block border-b py-3 px-4 sliding"
    >
      <UiTag v-for="(tag, i) in tokenlist.tags" :key="i" class="mr-2">
        {{ tag.name }}
      </UiTag>
    </div>
    <div>
      <div v-if="Object.keys(tokens).length > 0">
        <a
          v-for="(token, key) in tokens"
          :key="key"
          @click="onSelect(token.address)"
          class="block border-b last-child-border-0 py-3 px-4 highlight"
        >
          <Token :token="token" :symbol="true" :name="true" />
          <span class="float-right text-gray">
            {{ _num(token.balance) }}
          </span>
        </a>
      </div>
      <div v-else-if="loading" class="block text-center p-4">
        <UiLoading />
      </div>
      <div v-else v-text="$t('errorNoTokens')" class="block text-center p-4" />
    </div>
    <template v-slot:footer>
      <a v-text="$t('manageLists')" @click="$emit('selectTokenlist')" />
    </template>
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
    tokens: Object,
    tokenlist: Object,
    loading: Boolean
  },
  emits: ['close', 'inputSearch'],
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  }
};
</script>
