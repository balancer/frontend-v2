<template>
  <Sticky class="mb-4">
    <div
      v-if="web3.network.unknown"
      class="bg-red overflow-hidden"
      style="height: 4px;"
    ></div>
    <nav id="topnav" class="border-bottom width-full bg-black">
      <Container>
        <div class="d-flex flex-items-center" style="height: 78px;">
          <div class="flex-auto d-flex flex-items-center">
            <router-link
              :to="{ name: 'home' }"
              class="d-inline-block d-flex flex-items-center"
              style="font-size: 24px; padding-top: 4px;"
            >
              <span
                :class="space && 'hide-sm'"
                class="mr-1"
                v-text="'balancer'"
              />
            </router-link>
            <span
              v-if="web3.network.key !== '1'"
              style="font-size: 19px; padding-top: 6px;"
              class="pl-1 pr-2 text-gray"
              v-text="web3.network.shortName"
            />
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated">
              <UiButton
                @click="modalOpen = true"
                class="button-outline"
                :loading="app.authLoading"
              >
                <Avatar
                  :address="web3.account"
                  size="16"
                  class="mr-0 mr-sm-2 mr-md-2 mr-lg-2 mr-xl-2 ml-n1"
                />
                <span v-if="web3.name" v-text="web3.name" class="hide-sm" />
                <span v-else v-text="_shorten(web3.account)" class="hide-sm" />
              </UiButton>
            </template>
            <UiButton v-if="!$auth.isAuthenticated" @click="modalOpen = true">
              <span class="hide-sm" v-text="'Connect wallet'" />
              <Icon
                name="login"
                size="20"
                class="hide-md hide-lg hide-xl ml-n2 mr-n2 v-align-text-bottom"
              />
            </UiButton>
          </div>
        </div>
      </Container>
    </nav>
    <div v-if="1 === 2" class="p-2 text-center bg-blue" style="color: white;">
      <UiLoading class="fill-white mr-2" />
      <span class="d-inline-block pt-1">1 transaction pending</span>
    </div>
    <portal to="modal">
      <ModalAccount
        :open="modalOpen"
        @close="modalOpen = false"
        @login="handleLogin"
      />
      <ModalAbout :open="modalAboutOpen" @close="modalAboutOpen = false" />
    </portal>
  </Sticky>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      modalOpen: false,
      modalAboutOpen: false
    };
  },
  computed: {
    space() {
      const key = this.domain || this.$route.params.key;
      return this.app.spaces[key] ? this.app.spaces[key] : false;
    }
  },
  watch: {
    space() {
      this.setTitle();
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin(connector) {
      this.modalOpen = false;
      await this.login(connector);
    }
  }
};
</script>
