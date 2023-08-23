<script setup lang="ts">
import AppSlippageForm from '@/components/forms/AppSlippageForm.vue';
import Avatar from '@/components/images/Avatar.vue';
import useEthereumTxType from '@/composables/useEthereumTxType';
import { ethereumTxTypeOptions } from '@/constants/options';
import useWeb3 from '@/services/web3/useWeb3';
import { shorten } from '@/lib/utils';
import useDarkMode from '@/composables/useDarkMode';
import { getConnectorLogo } from '@/services/web3/wallet-logos';
import { getConnectorName } from '@/services/web3/wallet-names';
import { useUserSettings } from '@/providers/user-settings.provider';
import { isEIP1559SupportedNetwork } from '@/composables/useNetwork';
import { Network } from '@/lib/config/types';

// COMPOSABLES
const { darkMode, setDarkMode } = useDarkMode();

const {
  account,
  profile,
  disconnectWallet,
  toggleWalletSelectModal,
  connector,
  provider,
  userNetworkConfig,
  isUnsupportedNetwork,
  explorerLinks,
} = useWeb3();
const { ethereumTxType, setEthereumTxType } = useEthereumTxType();
const { supportSignatures, setSupportSignatures } = useUserSettings();

// DATA
const data = reactive({
  copiedAddress: false,
});

// COMPUTED
const avatarUri = computed(() => profile.value?.avatar || undefined);
const networkColorClass = computed(() => {
  let color = 'green';

  if (isUnsupportedNetwork.value) {
    color = 'red';
  } else {
    switch (userNetworkConfig.value?.chainId) {
      case Network.GOERLI:
        color = 'blue';
        break;
    }
  }

  return `bg-${color}-500 dark:bg-${color}-400`;
});
const networkName = computed(() => userNetworkConfig.value?.name);
const connectorName = computed(() =>
  getConnectorName(connector.value?.id, provider.value)
);
const connectorLogo = computed(() =>
  getConnectorLogo(connector.value?.id, provider.value)
);
const hideDisconnect = computed(() => connector.value?.id == 'safe');

// METHODS
function copyAddress() {
  navigator.clipboard.writeText(account.value);
  data.copiedAddress = true;

  setTimeout(() => {
    data.copiedAddress = false;
  }, 2 * 1000);
}
</script>

<template>
  <div>
    <div class="p-4 border-b dark:border-gray-900">
      <div class="flex justify-between items-center mb-6">
        <h5 class="tracking-tight leading-none" v-text="$t('account')" />
        <div class="flex gap-2 items-center">
          <BalBtn color="gray" size="xs" @click="toggleWalletSelectModal">
            {{ $t('change') }}
          </BalBtn>
          <div v-if="!hideDisconnect">
            <BalBtn
              outline
              color="gray"
              size="xs"
              class="capitalize"
              @click="disconnectWallet"
            >
              {{ $t('disconnect') }}
            </BalBtn>
          </div>
        </div>
      </div>
      <div class="flex mt-1 mb-1">
        <div class="flex">
          <div class="relative">
            <Avatar :iconURI="avatarUri" :address="account" :size="44" />
            <div class="connector-icon-wrapper">
              <img
                :src="connectorLogo"
                class="flex absolute right-0 bottom-0 justify-center items-center p-0.5 w-5 h-5 bg-white rounded-full"
              />
            </div>
          </div>
          <div class="ml-2">
            <div class="flex items-baseline address">
              <div
                class="font-bold text-black dark:text-white"
                v-text="shorten(account)"
              />
              <div class="flex ml-3">
                <BalTooltip width="auto">
                  <template #activator>
                    <BalBtn
                      circle
                      color="gray"
                      size="xs"
                      flat
                      @click="copyAddress"
                    >
                      <BalIcon
                        v-if="data.copiedAddress"
                        name="check"
                        size="xs"
                      />
                      <BalIcon v-else name="clipboard" size="xs" />
                    </BalBtn>
                  </template>
                  <div
                    class="text-center"
                    v-text="
                      data.copiedAddress ? $t('copied') : $t('copyAddress')
                    "
                  />
                </BalTooltip>
                <BalBtn
                  circle
                  flat
                  color="gray"
                  size="xs"
                  tag="a"
                  :href="explorerLinks.addressLink(account)"
                  target="_blank"
                  rel="noreferrer"
                  class="ml-2"
                >
                  <BalIcon name="arrow-up-right" size="xs" />
                </BalBtn>
              </div>
            </div>
            <div class="text-sm">
              {{ connectorName }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden px-4 mt-4">
      <span class="mb-2 font-medium" v-text="$t('theme')" />
      <div class="flex mt-1">
        <div
          class="flex justify-center items-center py-1.5 mr-2 w-16 rounded-xl border cursor-pointer option"
          :class="{ active: !darkMode }"
          @click="setDarkMode(false)"
        >
          <BalIcon name="sun" size="sm" />
        </div>
        <div
          class="flex justify-center items-center py-1.5 mr-2 w-16 rounded-xl border cursor-pointer option"
          :class="{ active: darkMode }"
          @click="setDarkMode(true)"
        >
          <BalIcon name="moon" size="sm" />
        </div>
      </div>
    </div>
    <div class="px-4 mt-4">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('slippageTolerance')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-html="$t('marketConditionsWarning')" />
        </BalTooltip>
      </div>
      <AppSlippageForm class="mt-1" />
    </div>
    <div v-if="isEIP1559SupportedNetwork" class="px-4 mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('transactionType')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-text="$t('ethereumTxTypeTooltip')" />
        </BalTooltip>
      </div>
      <BalBtnGroup
        v-model="ethereumTxType"
        :options="ethereumTxTypeOptions"
        @update:model-value="setEthereumTxType"
      />
    </div>
    <div class="px-4 mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('useSignatures')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-text="$t('useSignaturesTooltip')" />
        </BalTooltip>
      </div>
      <BalToggle
        v-model="supportSignatures"
        name="supportSignatures"
        @toggle="setSupportSignatures"
      />
    </div>
    <div
      class="p-4 mt-4 text-sm rounded-b-xl border-t dark:border-gray-900 network"
    >
      <div v-text="$t('network')" />
      <div class="flex items-baseline">
        <div :class="['w-2 h-2 mr-1 rounded-full', networkColorClass]" />
        {{ isUnsupportedNetwork ? $t('unsupportedNetwork') : networkName }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.address {
  @apply text-blue-500;

  font-variant-ligatures: no-contextual;
}

.option:hover {
  @apply text-blue-500 border-blue-500;
}

.option.active {
  @apply text-blue-500 border-blue-500;
}

.slippage-input {
  @apply bg-white;
}

.slippage-input.active {
  @apply text-blue-500 border-blue-500 border-2 ring;
}
</style>
