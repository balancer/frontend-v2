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
      <h3>Manage lists</h3>
    </template>
    <Search
      @input="$emit('inputSearch', $event)"
      placeholder="Search by name"
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
			      :name="activeLists[i] ? 'toggle-on' : 'toggle_off'"
			      :class="activeLists[i] ? 'text-green' : 'border-color'"
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
            {{ _numeral(tokenlist.tokens.length) }} tokens
          </span>
        </a>
      </div>
      <div v-else class="d-block text-center p-3">
        Oops, we can't find any list
      </div>
    </div>
    <template slot="footer">
      <a href="https://tokenlists.org" target="_blank">
        Browse lists
        <Icon name="external-link" class="ml-1" />
      </a>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: {
	  open: Boolean,
	  tokenlists: Object,
	  activeLists: Object
  },
  methods: {
    onSelect(name) {
      this.$emit('select', name);
    }
  }
};
</script>
