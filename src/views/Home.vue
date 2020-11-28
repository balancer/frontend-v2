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
            <h3 v-text="'Select token'" class="mb-2" />
            <UiButton @click="modalOpen = true">
              <template v-if="selectedToken">
                <img
                  :src="selectedToken.logoURI"
                  class="circle v-align-middle mr-1"
                  width="24"
                  height="24"
                />
                {{ selectedToken.symbol }}
              </template>
              <template v-else>Select token</template>
            </UiButton>
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
    <portal to="modal">
      <ModalSelectToken
        :open="modalOpen"
        @close="modalOpen = false"
        @select="selectedToken = $event"
        :tokens="getTokens"
        :tokenlist="getCurrentTokenlist"
        :balances="app.balances"
      />
    </portal>
  </Container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      modalOpen: false,
      selectedToken: false
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist'])
  },
  methods: {
    ...mapActions(['setSkin'])
  }
};
</script>
