<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 v-text="'Settings'" class="mb-4" />
        <div class="mb-4">
          <h3 v-text="'Current network'" class="mb-2" />
          <p>{{ web3.network.name }}</p>
        </div>
        <div class="mb-4">
          <h3 v-text="'Change theme'" class="mb-2" />
          <UiButton @click="setSkin('light')" class="mr-2">
            Light
          </UiButton>
          <UiButton @click="setSkin('dark')" class="mr-2">
            Dark
          </UiButton>
          <UiButton @click="setSkin('classic')">
            Classic
          </UiButton>
        </div>
      </div>
      <Circular />
    </template>
  </Layout>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['setSkin'])
  }
};
</script>
