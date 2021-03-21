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
            <router-link
              :to="{ name: 'trade' }"
              :class="[
                'ml-8 font-medium text-gray-500',
                { 'text-gray-900': $route.name === 'trade' }
              ]"
            >
              {{ $t('trade') }}
            </router-link>
            <router-link
              :to="{ name: 'home' }"
              :class="[
                'ml-8 font-medium text-gray-500',
                { 'text-gray-900': $route.name === 'home' }
              ]"
            >
              {{ $t('invest') }}
            </router-link>
          </div>
          <div :key="web3.account">
            <div v-if="$auth.isAuthenticated.value" class="flex items-center">
              <BalBtn
                v-if="totalPending"
                tag="a"
                :href="`https://claim.balancer.finance/#/${web3.account}`"
                target="_blank"
                rel="noreferrer"
                color="gradient"
                rounded
                class="mr-2"
              >
                ✨ {{ _num(totalPending) }} BAL
              </BalBtn>
              <BalBtn
                class="auth-btn"
                :loading="app.authLoading"
                :loading-label="
                  ['sm', 'md'].includes(bp) ? '' : 'Connecting...'
                "
                color="gray"
                outline
                rounded
                :circle="['sm', 'md'].includes(bp)"
              >
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
              </BalBtn>
              <SettingsPopover v-if="!app.authLoading" class="popover" />
            </div>
            <BalBtn
              v-else
              color="gray"
              outline
              rounded
              :circle="['sm', 'md'].includes(bp)"
              @click="setAccountModal(true)"
            >
              <span
                class="hidden md:inline-block"
                v-text="$t('connectWallet')"
              />
              <BalIcon name="log-out" size="sm" class="md:hidden" />
            </BalBtn>
          </div>
        </div>
      </div>
    </nav>
  </Sticky>
</template>

<script>
import { defineComponent } from 'vue';
import { mapActions, mapMutations } from 'vuex';
import getProvider from '@/utils/provider';
import { getPendingClaims } from '@/utils/balancer/claim';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  setup() {
    const { bp } = useBreakpoints();
    return { bp };
  },

  data() {
    return {
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
    ...mapMutations(['setAccountModal']),

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
});
</script>

<style scoped lang="css">
#topnav {
  @apply w-full shadow;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent dark:border-gray-700;
}

.auth-btn:hover ~ .popover {
  display: initial;
}
</style>
