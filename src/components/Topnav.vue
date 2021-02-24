<template>
  <Sticky :key="`${web3.network.unknown}${notifications.watch.length}`">
    <nav id="topnav" class="border-b width-full block-bg">
      <div
        :key="web3.network.unknown"
        v-if="web3.network.unknown"
        class="p-2 flex bg-red-500 justify-center"
        style="color: white;"
      >
        <Icon name="warning1" size="20" class="mr-1" />
        {{
          $t(
            web3.network.shortName
              ? 'unavailableOnNetworkWithName'
              : 'unavailableOnNetwork',
            [web3.network.shortName]
          )
        }}
      </div>
      <div class="px-6">
        <div class="flex items-center" style="height: 78px;">
          <div class="flex-auto flex items-center">
            <router-link :to="{ name: 'home' }" class="flex items-center pr-2">
              <img
                v-if="app.skin === 'light'"
                src="~@/assets/logo-light.svg"
                width="30"
                class="mr-2"
              />
              <img
                v-else
                src="~@/assets/logo-dark.svg"
                width="30"
                class="mr-2"
              />
              <span
                class="mr-1 font-secondary text-lg font-semibold"
                v-text="'Balancer'"
              />
            </router-link>
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated.value">
              <router-link
                v-if="totalPending"
                :to="{ name: 'claim', params: { address: web3.account } }"
              >
                <UiButton class="button--submit mr-2 hidden md:inline-block">
                  ✨ {{ _num(totalPending) }} BAL
                </UiButton>
              </router-link>
              <UiButton
                @click="modalOpen = true"
                class="button-outline"
                :loading="app.authLoading"
              >
                <Avatar
                  :address="web3.account"
                  :profile="web3.profile"
                  size="16"
                />
                <span
                  v-if="web3.profile.name || web3.profile.ens"
                  v-text="web3.profile.name || web3.profile.ens"
                  class="pl-2 hidden md:inline-block"
                />
                <span
                  v-else
                  v-text="_shorten(web3.account)"
                  class="pl-2 hidden md:inline-block"
                />
              </UiButton>
            </template>
            <UiButton
              v-if="!$auth.isAuthenticated.value"
              @click="modalOpen = true"
            >
              <span
                class="hidden md:inline-block"
                v-text="$t('connectWallet')"
              />
              <Icon name="login" size="20" class="-ml-2 -mr-2 md:hidden" />
            </UiButton>
            <router-link :to="{ name: 'settings' }" class="ml-2">
              <UiButton>
                <Icon name="gear" size="22" class="-ml-2 -mr-2" />
              </UiButton>
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    <div
      v-if="notifications.watch.length > 0"
      class="p-2 text-center bg-blue-500"
      style="color: white;"
    >
      <UiLoading class="fill-white mr-2" />
      <span class="inline-block pt-1">
        {{ $tc('transactionPending', _num(notifications.watch.length)) }}
      </span>
    </div>
    <teleport to="#modal">
      <ModalAccount
        :open="modalOpen"
        @close="modalOpen = false"
        @login="handleLogin"
      />
    </teleport>
  </Sticky>
</template>

<script>
import { mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import { getPendingClaims } from '@/utils/balancer/claim';

export default {
  data() {
    return {
      modalOpen: false,
      pendingClaims: false,
      totalPending: false
    };
  },
  watch: {
    'web3.account': function() {
      this.pendingClaims = false;
      this.totalPending = false;
      if (this.web3.account) this.getPendingClaims();
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin(connector) {
      this.modalOpen = false;
      await this.login(connector);
    },
    async getPendingClaims() {
      const network = '1' || this.web3.network.key;
      const provider = getProvider(network);
      const pendingClaims = await getPendingClaims(
        network,
        provider,
        this.web3.account
      );
      this.pendingClaims = pendingClaims;
      this.totalPending = pendingClaims
        .map(claim => parseFloat(claim.amount))
        .reduce((a, b) => a + b, 0);
    }
  }
};
</script>

<style scoped lang="scss">
#topnav {
  box-shadow: 0 0 12px -6px var(--border-color);
}
</style>
