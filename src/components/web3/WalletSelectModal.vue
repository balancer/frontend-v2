<template>
  <BalModal
    :show="isVisible"
    @close="$emit('close')"
    title="Connect to a wallet"
  >
    <p class="pb-3 text-sm">
      By connecting a wallet, I agree to Balancer Labs’

      <router-link :to="{ name: 'terms-of-use' }" target="_blank">
        <span
          className="link"
          >Terms of Use</span
        >,
      </router-link>

      <router-link :to="{ name: 'cookies-policy' }" target="_blank">
        <span
          className="link"
          >Cookies Policy</span
        >
        and
      </router-link>

      <router-link :to="{ name: 'privacy-policy' }" target="_blank">
        <span
          className="link"
          >Privacy Policy</span
        >.
      </router-link>
    </p>
    <WalletButton v-for="wallet in wallets" :wallet="wallet" :key="wallet" />
    <div
      class="
        p-4
        rounded-lg
        bg-gradient-to-b
        from-gray-50
        dark:from-gray-900
        to-gray-100
        dark:to-gray-850
      "
    >
      <h6>New to Ethereum?</h6>
      <p class="text-sm">
        Balancer is a DeFi app on Ethereum. Set up an Ethereum Wallet to Invest
        and Trade here.
        <BalLink :href="EXTERNAL_LINKS.Ethereum.Wallets" external>
          Learn&nbsp;More
          <span class="align-middle"
            ><BalIcon name="arrow-up-right" size="sm"
          /></span>
        </BalLink>
      </p>
    </div>
  </BalModal>
</template>

<script lang="ts">
import { SupportedWallets } from '@/services/web3/web3.plugin';
import WalletButton from '@/components/web3/WalletButton.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import { defineComponent } from 'vue';
export default defineComponent({
  emits: ['close'],
  components: {
    WalletButton
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      wallets: SupportedWallets.filter(id => id !== 'gnosis'),
      EXTERNAL_LINKS
    };
  }
});
</script>
