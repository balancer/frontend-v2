<template>
  <nav id="topnav">
    <NavAlert v-if="alert" :alert="alert" />

    <div class="px-6">
      <div class="flex items-center" style="height: 78px;">
        <div class="flex-auto flex items-center">
          <router-link :to="{ name: 'home' }" class="flex items-center pr-2">
            <AppLogo />
          </router-link>
          <router-link
            :to="{ name: 'trade' }"
            :class="[
              'ml-8 font-medium',
              $route.name === 'trade' ? 'text-gray-900' : 'text-gray-500'
            ]"
          >
            {{ $t('trade') }}
          </router-link>
          <router-link
            :to="{ name: 'home' }"
            :class="[
              'ml-8 font-medium',
              $route.name === 'home' ? 'text-gray-900' : 'text-gray-500'
            ]"
          >
            {{ $t('invest') }}
          </router-link>
        </div>
        <div>
          <div v-if="$auth.isAuthenticated.value" class="flex items-center">
            <BalBtn
              v-if="totalPending"
              tag="a"
              :href="`https://claim.balancer.finance/#/${account}`"
              target="_blank"
              rel="noreferrer"
              color="gradient"
              rounded
              class="mr-2"
              size="sm"
            >
              ✨ {{ _num(totalPending) }} BAL
            </BalBtn>
            <div class="relative">
              <BalBtn
                class="auth-btn"
                :loading="web3Loading"
                :loading-label="
                  ['sm', 'md'].includes(bp) ? '' : 'Connecting...'
                "
                color="gray"
                outline
                rounded
                :size="['sm', 'md'].includes(bp) ? 'md' : 'sm'"
                :circle="['sm', 'md'].includes(bp)"
              >
                <Avatar :address="account" :profile="profile" size="20" />
                <span
                  v-if="profile.name || profile.ens"
                  v-text="profile.name || profile.ens"
                  class="pl-2 hidden md:inline-block"
                />
                <span
                  v-else
                  v-text="_shorten(account)"
                  class="pl-2 hidden md:inline-block"
                />
              </BalBtn>
              <SettingsPopover v-if="!web3Loading" class="popover" />
            </div>
          </div>
          <BalBtn
            v-else
            color="gray"
            outline
            rounded
            :size="['sm', 'md'].includes(bp) ? 'md' : 'sm'"
            :circle="['sm', 'md'].includes(bp)"
            @click="setAccountModal(true)"
          >
            <span class="hidden md:inline-block" v-text="$t('connectWallet')" />
            <BalIcon name="log-out" size="sm" class="md:hidden" />
          </BalBtn>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, defineComponent, reactive, toRefs, watch } from 'vue';
import { useStore } from 'vuex';
import getProvider from '@/utils/provider';
import { getPendingClaims } from '@/utils/balancer/claim';
import useBreakpoints from '@/composables/useBreakpoints';
import AppLogo from '@/components/images/AppLogo.vue';
import NavAlert from './NavAlert.vue';
import useWeb3 from '@/composables/useWeb3';

export default defineComponent({
  components: {
    AppLogo,
    NavAlert
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading, userNetwork } = useWeb3();

    // DATA
    const data = reactive({
      pendingClaims: false,
      totalPending: false
    });

    // COMPUTED
    const alert = computed(() => store.state.alerts.current);

    // METHODS
    const setAccountModal = val => store.commit('web3/setAccountModal', val);

    async function getClaimsData() {
      const provider = getProvider(userNetwork.value.key);
      const pendingClaims = await getPendingClaims(
        userNetwork.value.key,
        provider,
        account.value
      );
      data.pendingClaims = pendingClaims;
      data.totalPending = pendingClaims
        .map(claim => parseFloat(claim.amount))
        .reduce((a, b) => a + b, 0);
    }

    // WATCHERS
    watch(account, newAccount => {
      data.pendingClaims = false;
      data.totalPending = false;
      if (newAccount) getClaimsData();
    });

    return {
      // data
      ...toRefs(data),
      // computed
      account,
      profile,
      web3Loading,
      bp,
      alert,
      // methods
      setAccountModal
    };
  }
});
</script>

<style scoped>
#topnav {
  @apply w-full shadow;
  @apply bg-white dark:bg-gray-900;
  @apply border-b border-transparent dark:border-gray-700;
}

.auth-btn:hover ~ .popover {
  @apply visible opacity-100;
}
</style>
