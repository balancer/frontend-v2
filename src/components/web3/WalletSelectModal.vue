<script setup lang="ts">
import { ref } from 'vue';

import WalletButton from '@/components/web3/WalletButton.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import { SupportedWallets } from '@/services/web3/web3.plugin';

interface Props {
  isVisible?: boolean;
  onShowThirdParty: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close']);

const wallets = ref(SupportedWallets.filter(id => id !== 'gnosis'));
</script>

<template>
  <BalModal
    :show="props.isVisible"
    title="Connect to a wallet"
    @close="emit('close')"
  >
    <p class="pb-3 text-sm">
      {{ $t('byConnectingWallet') }}
      <router-link :to="{ name: 'terms-of-use' }" target="_blank">
        <span className="link">{{ $t('policies.termsOfUse') }}</span
        >,
      </router-link>
      <router-link :to="{ name: 'cookies-policy' }" target="_blank">
        <span className="link">{{
          $t('policies.cookiesPolicy')
        }}</span> </router-link
      >,
      <span>{{ $t('useOf') }}&nbsp;</span>
      <button @click="onShowThirdParty">
        <BalLink>
          <span>{{ $t('policies.thirdPartyServices') }}</span>
        </BalLink>
      </button>
      {{ $t('and') }}
      <router-link :to="{ name: 'privacy-policy' }" target="_blank">
        <span className="link">{{ $t('policies.privacyPolicy') }}</span
        >.
      </router-link>
    </p>
    <WalletButton v-for="wallet in wallets" :key="wallet" :wallet="wallet" />
    <div
      class="p-4 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-850 rounded-lg"
    >
      <h6>{{ $t('newToEthereum') }}</h6>
      <p class="text-sm">
        {{ $t('setUpEthereumWallet') }}
        <BalLink :href="EXTERNAL_LINKS.Ethereum.Wallets" external>
          {{ $t('learnMore') }}
          <span class="align-middle"
            ><BalIcon name="arrow-up-right" size="sm"
          /></span>
        </BalLink>
      </p>
    </div>
  </BalModal>
</template>
