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
      class="py-3 px-4 border-b"
    />
    <div>
      <div v-if="Object.keys(tokenlists).length > 0">
        <a
          v-for="(tokenlist, i) in tokenlists"
          :key="i"
          @click="onSelect(i)"
          class="block border-b last-child-border-0 py-3 px-4 highlight"
        >
          <Icon
            :name="tokenlist.active ? 'toggle-on' : 'toggle_off'"
            :class="tokenlist.active ? 'text-green-500' : 'border-color'"
            size="32"
            class="mt-n1 mr-3 float-left"
          />
          <img
            :src="_url(tokenlist.logoURI)"
            class="rounded-full inline-block align-middle mr-1"
            width="24"
            height="24"
          />
          {{ tokenlist.name }}
          <span class="text-gray float-right ml-1">
            {{ _num(tokenlist.tokens.length) }} {{ $t('tokensLowerCase') }}
          </span>
        </a>
      </div>
      <div v-else v-text="$t('errorNoLists')" class="block text-center p-4" />
    </div>
    <template v-slot:footer>
      <a href="https://tokenlists.org" target="_blank">
        {{ $t('browseLists') }}
        <Icon name="external-link" class="ml-1" />
      </a>
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
    tokenlists: Object
  },
  emits: ['back', 'close', 'inputSearch'],
  methods: {
    onSelect(name) {
      this.$emit('select', name);
    }
  }
};
</script>
