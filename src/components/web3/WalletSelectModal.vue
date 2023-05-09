<script setup lang="ts">
import { ref } from 'vue';

import WalletButton from '@/components/web3/WalletButton.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import { SupportedWallets } from '@/providers/wallet.provider';
import LS_KEYS from '@/constants/local-storage.keys';
import { useWalletHelpers } from '@/composables/useWalletHelpers';
import { useUserAgent } from '@/composables/useUserAgent';

interface Props {
  isVisible?: boolean;
  onShowThirdParty: () => void;
}

type AcceptedLocalStorageItemType = '0' | '1' | null;

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close']);

const { isMobile } = useUserAgent();
const { getIsMetaMaskBrowser } = useWalletHelpers();

const wallets = SupportedWallets.filter(id => {
  // hide metamask wallet on all mobile browsers except metamask
  if (id === 'metamask' && isMobile && !getIsMetaMaskBrowser()) {
    return false;
  }

  // Hide all wallets except metamask on metamask browser
  if (id !== 'metamask' && getIsMetaMaskBrowser()) {
    return false;
  }

  return id !== 'safe';
});

const acceptedlocalStorageItem = localStorage.getItem(
  LS_KEYS.App.TermsAccepted
) as AcceptedLocalStorageItemType;

const accepted = ref<'0' | '1'>(acceptedlocalStorageItem || '0');

const isBalRulesAccepted = computed(() => accepted.value === '1');

function onBalRulesAccepted() {
  accepted.value = isBalRulesAccepted.value ? '0' : '1';
  localStorage.setItem(LS_KEYS.App.TermsAccepted, accepted.value);
}
</script>

<template>
  <BalModal
    :show="props.isVisible"
    title="Connect to a wallet"
    @close="emit('close')"
  >
    <BalRadio
      :checked="isBalRulesAccepted"
      value="bal-rules"
      name="bal-rules"
      size="lg"
      @update:model-value="onBalRulesAccepted"
    >
      <template #label>
        <p class="pb-3 pl-1 -mt-1 mb-2 text-base">
          {{ $t('byConnectingWallet') }}
          <router-link
            :to="{ name: 'terms-of-use' }"
            target="_blank"
            @click.stop=""
          >
            <span className="link">{{ $t('policies.termsOfUse') }} </span>,
          </router-link>
          <router-link :to="{ name: 'risks' }" target="_blank" @click.stop="">
            <span className="link">{{ $t('policies.risks') }} </span>,
          </router-link>
          <router-link
            :to="{ name: 'cookies-policy' }"
            target="_blank"
            @click.stop=""
          >
            <span className="link">
              {{ $t('policies.cookiesPolicy') }}
            </span> </router-link
          >,
          <span>{{ $t('useOf') }}&nbsp;</span>
          <button @click.stop="onShowThirdParty">
            <BalLink>
              <span>{{ $t('policies.thirdPartyServices') }}</span>
            </BalLink>
          </button>
          {{ $t('and') }}
          <router-link
            :to="{ name: 'privacy-policy' }"
            target="_blank"
            @click.stop=""
          >
            <span className="link">{{ $t('policies.privacyPolicy') }} </span>.
          </router-link>
        </p>
      </template>
    </BalRadio>

    <div
      :class="[
        !isBalRulesAccepted && 'grayscale pointer-events-none opacity-20',
        'transition-opacity duration-200',
      ]"
    >
      <WalletButton v-for="wallet in wallets" :key="wallet" :wallet="wallet" />
      <div
        class="p-4 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-850 rounded-lg"
      >
        <h6>{{ $t('newToEthereum') }}</h6>
        <p class="text-sm">
          {{ $t('setUpEthereumWallet') }}
          <BalLink :href="EXTERNAL_LINKS.Ethereum.Wallets" external>
            {{ $t('learnMore') }}
            <span class="align-middle">
              <BalIcon name="arrow-up-right" size="sm" />
            </span>
          </BalLink>
        </p>
      </div>
    </div>
  </BalModal>
</template>
