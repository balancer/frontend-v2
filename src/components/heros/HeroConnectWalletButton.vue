<script lang="ts" setup>
import useDarkMode from '@/composables/useDarkMode';
import useFathom from '@/composables/useFathom';
import useConnector from '@/services/web3/useConnector';

/**
 * COMPOSABLES
 */
const { startConnectWithInjectedProvider } = useConnector();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();

/**
 * METHODS
 */
function onClickConnect() {
  startConnectWithInjectedProvider();
  trackGoal(Goals.ClickHeroConnectWallet);
}
</script>

<template>
  <BalBtn :color="darkMode ? 'blue' : 'white'" @click="onClickConnect">
    {{ $t('connectWallet') }}
  </BalBtn>
</template>
