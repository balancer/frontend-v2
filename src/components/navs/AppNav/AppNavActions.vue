<script lang="ts" setup>
import { computed } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppNavAccountBtn from './AppNavAccountBtn.vue';
import useWeb3 from '@/services/web3/useWeb3';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import { useSidebar } from '@/composables/useSidebar';

/**
 * COMPOSABLES
 */
const { isMobile } = useBreakpoints();
const { account, connector, toggleWalletSelectModal } = useWeb3();
const { setSidebarOpen } = useSidebar();

/**
 * COMPUTED
 */
const hideNetworkSelect = computed(() => connector.value?.id === 'gnosis');
</script>

<template>
  <div class="grid gap-2 grid-rows-1 grid-flow-col">
    <DarkModeToggle />
    <AppNavActivityBtn v-if="account" />
    <AppNavAccountBtn v-if="account" />
    <BalBtn
      v-else
      color="white"
      :size="isMobile ? 'md' : 'sm'"
      @click="toggleWalletSelectModal"
    >
      <WalletIcon class="mr-2" />
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <span class="lg:hidden" v-text="$t('connect')" />
    </BalBtn>
    <AppNavNetworkSelect v-if="!hideNetworkSelect" />
    <BalBtn
      v-if="isMobile"
      color="white"
      @click="setSidebarOpen(true)"
      flat
      circle
    >
      <BalIcon name="menu" size="lg" />
    </BalBtn>
  </div>
</template>
