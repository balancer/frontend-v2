<template>
  <div id="app" class="overflow-x-hidden lg:overflow-x-visible">
    <UiLoading v-if="app.loading || !app.init" />
    <div v-else>
      <Topnav />
      <div class="pb-12">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <ModalAccount
      :open="web3.modal"
      @close="setAccountModal(false)"
      @login="handleLogin"
    />
    <Notifications />
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

export default {
  mounted() {
    this.init();
  },

  methods: {
    ...mapActions(['init', 'login']),
    ...mapMutations(['setAccountModal']),

    async handleLogin(connector) {
      this.setAccountModal(false);
      await this.login(connector);
    }
  }
};
</script>
