<template>
  <div>
    <div
      v-if="!isAuthenticated"
      class="app-hero h-72 flex items-center justify-center px-4"
    >
      <div class="w-full sm:w-3/4 md:w-1/2">
        <h1 class="text-white text-bold text-center">
          An automated portfolio manager and trading platform.
        </h1>
        <div class="flex justify-center mt-4">
          <BalBtn color="white" class="mr-4" @click="setAccountModal(true)">
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            href="https://balancer.fi"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
          >
            {{ $t('learnMore') }}
            <BalIcon name="external-link" size="sm" class="ml-2" />
          </BalBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import useAuth from '@/composables/useAuth';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'AppHero',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { isAuthenticated } = useAuth();

    // COMPUTED
    const setAccountModal = val => store.commit('web3/setAccountModal', val);

    return {
      // computed
      isAuthenticated,
      // methods
      setAccountModal
    };
  }
});
</script>

<style scoped>
.app-hero {
  @apply bg-cover;
  background-image: url('/images/backgrounds/bg-connect-wallet.svg');
}
</style>
