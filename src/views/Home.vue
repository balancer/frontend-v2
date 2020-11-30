<template>
  <Container :slim="true">
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div class="px-4 px-md-0">
          <h1 v-text="'Dashboard'" class="mb-4" />
          <div class="mb-4">
            <router-link :to="{ name: 'pool' }" class="mr-2">Pool</router-link>
            <router-link :to="{ name: 'create' }" class="mr-2"
              >Create</router-link
            >
          </div>
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
          <div class="mb-4">
            <h3 v-text="'Send transaction'" class="mb-2" />
            <UiButton @click="setSkin('light')" class="mr-2">
              Send
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['setSkin'])
  }
};
</script>
