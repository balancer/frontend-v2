<script lang="ts" setup>
import { computed, ref } from 'vue';

import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useSidebar } from '@/composables/useSidebar';
import useWeb3 from '@/services/web3/useWeb3';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import AppNavSettingsModal from '../../modals/AppNavSettingsModal.vue';
import AppNavDownloadModal from '../../modals/AppNavDownloadModal.vue';

/**
 * COMPOSABLES
 */
const { isMobile, isDesktop } = useBreakpoints();
const { account, connector, startConnectWithInjectedProvider } = useWeb3();
const { setSidebarOpen } = useSidebar();

/**
 * STATE
 */
const settingsModal = ref(false);
const downloadModal = ref(false);

/**
 * COMPUTED
 */
const hideNetworkSelect = computed(() => connector.value?.id === 'gnosis');
</script>

<template>
  <div class="flex">
    <div class="grid grid-rows-1 grid-flow-col gap-2">
      <DarkModeToggle v-if="isDesktop" />
      <AppNavActivityBtn v-if="account" />
      <AppNavAccountBtn v-if="account" />
      <BalBtn
        v-else
        color="white"
        :size="isMobile ? 'md' : 'sm'"
        @click="startConnectWithInjectedProvider"
      >
        <WalletIcon class="mr-2" />
        <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
        <span class="lg:hidden" v-text="$t('connect')" />
      </BalBtn>
      <AppNavNetworkSelect v-if="!hideNetworkSelect" />
    </div>
    <div class="grid grid-rows-1 grid-flow-col gap-0 ml-2">
      <AppNavSettingsModal
        v-if="settingsModal"
        @close="settingsModal = false"
      />
      <AppNavDownloadModal
        v-if="downloadModal"
        @close="downloadModal = false"
      />
      <BalBtn color="white" flat circle size="sm" @click="settingsModal = true">
        <BalIcon name="settings" size="md" />
      </BalBtn>
      <BalBtn color="white" flat circle size="sm" @click="downloadModal = true">
        <BalIcon name="download" size="md" />
      </BalBtn>
      <BalBtn
        v-if="isMobile"
        color="white"
        flat
        circle
        @click="setSidebarOpen(true)"
      >
        <BalIcon name="menu" size="lg" />
      </BalBtn>
    </div>
  </div>
</template>
