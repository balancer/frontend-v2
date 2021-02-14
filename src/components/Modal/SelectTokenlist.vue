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
    <template slot="header">
      <h3 v-text="$t('manageLists')" />
    </template>
    <Search
      @input="$emit('inputSearch', $event)"
      :placeholder="$t('searchByName')"
      class="p-3 border-bottom"
    />
    <div>
      <div v-if="Object.keys(tokenlists).length > 0">
        <a
          v-for="(tokenlist, i) in tokenlists"
          :key="i"
          @click="onSelect(i)"
          class="d-block border-bottom last-child-border-0 p-3 highlight"
        >
          <Icon
            :name="tokenlist.active ? 'toggle-on' : 'toggle_off'"
            :class="tokenlist.active ? 'text-green' : 'border-color'"
            size="32"
            class="mt-n1 mr-3 float-left"
          />
          <img
            :src="_url(tokenlist.logoURI)"
            class="circle v-align-middle mr-1"
            width="24"
            height="24"
          />
          {{ tokenlist.name }}
          <span class="text-gray float-right ml-1">
            {{ _num(tokenlist.tokens.length) }} {{ $t('tokensLowerCase') }}
          </span>
        </a>
      </div>
      <div v-else v-text="$t('errorNoLists')" class="d-block text-center p-3" />
    </div>
    <template slot="footer">
      <a href="https://tokenlists.org" target="_blank">
        {{ $t('browseLists') }}
        <Icon name="external-link" class="ml-1" />
      </a>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    tokenlists: Object
  },
  methods: {
    onSelect(name) {
      this.$emit('select', name);
    }
  }
};
</script>
