<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import {
  NetworkSyncState,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';
import useWeb3 from '@/services/web3/useWeb3';

defineEmits(['showProceedModal']);

const {
  networksSyncState,
  tempSyncingNetworks,
  l2VeBalBalances,
  isLoading: isLoadingSyncState,
} = useCrossChainSync();
const { networkId } = useNetwork();
const { account } = useWeb3();

const showVeBalSyncTip = computed(() => {
  const state = networksSyncState.value[networkId.value];

  return (
    !isLoadingSyncState.value &&
    state === NetworkSyncState.Unsynced &&
    !!tempSyncingNetworks.value[account.value] &&
    tempSyncingNetworks.value[account.value].networks.includes(networkId.value)
  );
});

const veBalSyncTip = computed(() => {
  if (!showVeBalSyncTip.value) return null;

  if (Number(l2VeBalBalances.value?.[networkId.value]) > 0) {
    return {
      title: 'Resync if you acquire new veBAL',
      text: 'Newly acquired veBAL doesn’t auto-sync to L2s. Remember to resync on Ethereum Mainnet after acquiring more veBAL to continue boosting to your max.',
    };
  }

  return {
    title: 'Sync your veBAL to maximize your boost',
    text: 'If you have veBAL, sync your veBAL balance from Ethereum Mainnet to max your boost while staking on Arbitrum. Resync after acquiring more veBAL to continue boosting to your max.',
  };
});
</script>

<template>
  <BalAlert
    v-if="showVeBalSyncTip"
    :title="veBalSyncTip?.title"
    type="tip"
    class="mb-5 w-100"
  >
    <div class="flex items-center">
      <div class="flex-[2]">{{ veBalSyncTip?.text }}</div>
      <div class="flex flex-1 justify-end">
        <BalBtn color="gradient" @click="$emit('showProceedModal')">
          Sync veBAL
        </BalBtn>
      </div>
    </div>
  </BalAlert>
</template>