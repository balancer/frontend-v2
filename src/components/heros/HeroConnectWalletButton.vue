<script lang="ts" setup>
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * COMPOSABLES
 */
const { startConnectWithInjectedProvider } = useWeb3();
const { trackGoal, Goals } = useFathom();

/**
 * METHODS
 */
function onClickConnect() {
  startConnectWithInjectedProvider();
  trackGoal(Goals.ClickHeroConnectWallet);
}
</script>

<template>
  <BalBtn blue @click="onClickConnect">
    {{ $t('connectWallet') }}
  </BalBtn>
</template>
