<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="$t('selectToken')" />
    </template>
    <Search
      @input="$emit('inputSearch', $event)"
      :placeholder="$t('searchBy')"
      class="p-3 border-bottom"
    />
    <div
      v-if="tokenlist.tags && Object.keys(tokenlist.tags).length > 0"
      class="d-block border-bottom p-3 sliding"
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
          class="d-block border-bottom last-child-border-0 p-3 highlight"
        >
          <Token :token="token" :symbol="true" :name="true" />
          <span class="float-right text-gray">
            {{ _num(token.balance) }}
          </span>
        </a>
      </div>
      <div v-else-if="loading" class="d-block text-center p-3">
        <UiLoading />
      </div>
      <div
        v-else
        v-text="$t('errorNoTokens')"
        class="d-block text-center p-3"
      />
    </div>
    <template v-slot:footer>
      <a v-text="$t('manageLists')" @click="$emit('selectTokenlist')" />
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    tokens: Object,
    tokenlist: Object,
    loading: Boolean
  },
  emits: ['close'],
  methods: {
    onSelect(token) {
      this.$emit('select', token);
      this.$emit('close');
    }
  }
};
</script>
