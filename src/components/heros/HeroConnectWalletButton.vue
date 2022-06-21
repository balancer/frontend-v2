<script lang="ts" setup>
import useDarkMode from '@/composables/useDarkMode';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * COMPOSABLES
 */
const { tryConnectWithInjectedProvider } = useWeb3();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();

/**
 * METHODS
 */
function onClickConnect() {
  tryConnectWithInjectedProvider();
  trackGoal(Goals.ClickHeroConnectWallet);
}
</script>

<template>
  <BalBtn :color="darkMode ? 'gray' : 'white'" @click="onClickConnect">
    {{ $t('connectWallet') }}
  </BalBtn>
</template>
