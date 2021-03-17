<template>
  <Sticky :key="`${web3.config.unknown}${notifications.watch.length}`">
    <nav id="topnav">
      <div
        :key="web3.config.unknown"
        v-if="web3.config.unknown"
        class="p-2 flex bg-red-500 justify-center text-base"
        style="color: white;"
      >
        <Icon name="warning1" size="20" class="mr-1" />
        {{
          $t(
            web3.config.shortName
              ? 'unavailableOnNetworkWithName'
              : 'unavailableOnNetwork',
            [web3.config.shortName]
          )
        }}
      </div>
      <div class="px-6">
        <div class="flex items-center" style="height: 78px;">
          <div class="flex-auto flex items-center">
            <router-link :to="{ name: 'home' }" class="flex items-center pr-2">
              <img
                v-if="app.darkMode"
                src="~@/assets/logo-dark.svg"
                width="30"
                class="mr-2"
              />
              <img
                v-else
                src="~@/assets/logo-light.svg"
                width="30"
                class="mr-2"
              />
              <span
                class="mr-1 font-secondary text-xl font-semibold"
                v-text="'Balancer'"
              />
            </router-link>
            <router-link :to="{ name: 'trade' }" class="ml-4 font-bold">
              {{ $t('trade') }}
            </router-link>
            <router-link :to="{ name: 'home' }" class="ml-4 font-bold">
              {{ $t('invest') }}
            </router-link>
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated.value">
              <a
                v-if="totalPending"
                :href="`https://claim.balancer.finance/#/${web3.account}`"
                target="_blank"
              >
                <UiButton class="button--submit mr-2 hidden md:inline-block">
                  ✨ {{ _num(totalPending) }} BAL
                </UiButton>
              </a>
              <UiButton class="button-outline" :loading="app.authLoading">
                <Avatar
                  :address="web3.account"
                  :profile="web3.profile"
                  size="20"
                />
                <span
                  v-if="web3.profile.name || web3.profile.ens"
                  v-text="web3.profile.name || web3.profile.ens"
                  class="pl-2 text-base hidden md:inline-block"
                />
                <span
                  v-else
                  v-text="_shorten(web3.account)"
                  class="pl-2 text-base hidden md:inline-block"
                />
              </UiButton>
              <SettingsPopover v-if="!app.authLoading" class="popover" />
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
      const network = '1' || this.web3.config.key;
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

<style scoped lang="css">
#topnav {
  @apply w-full shadow;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent dark:border-gray-700;
}
.button-outline:hover ~ .popover {
  display: initial;
}
</style>
