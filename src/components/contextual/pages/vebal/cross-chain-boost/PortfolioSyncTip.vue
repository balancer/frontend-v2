<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import {
  NetworkSyncState,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';
import useWeb3 from '@/services/web3/useWeb3';

type Props = {
  shouldPokePoolsMap?: Record<string, string>;
};

const props = defineProps<Props>();

defineEmits(['showProceedModal', 'showPokeAllGaugeModal']);

const {
  networksSyncState,
  tempSyncingNetworks,
  l2VeBalBalances,
  isLoading: isLoadingSyncState,
} = useCrossChainSync();

const { networkId } = useNetwork();
const { account } = useWeb3();

const veBalSyncTip = computed(() => {
  if (isLoadingSyncState.value) return null;
  const state = networksSyncState.value[networkId.value];

  const isUnsyncedOrSyncing =
    state === NetworkSyncState.Unsynced &&
    !!tempSyncingNetworks.value[account.value] &&
    tempSyncingNetworks.value[account.value].networks.includes(networkId.value);

  if (isUnsyncedOrSyncing) {
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
  }

  if (Object.keys(props.shouldPokePoolsMap || {}).length > 0) {
    return {
      title: 'Poke to refresh gauges for boosted APRs',
      text: 'After your veBAL is synced to an L2, the pool gauge remains unaware of your new balance until it is interacted with. ‘Poke all’ to gas-efficiently update all gauges. Otherwise, interact with each gauge individzually (e.g. by Claiming BAL).',
      showPokeAllBtn: true,
      hideBtn: true,
    };
  }

  const isSynced = state === NetworkSyncState.Synced;

  if (isSynced) {
    return {
      title: 'Trigger pool gauge updates to get your boosts',
      text: 'Pool gauges don’t automatically recognize changes in veBAL until triggered. Updates are triggered when you interact with a gauge (e.g. by claiming BAL, stake/unstake or explicitly update the gauge on each individual pool page)',
      hideBtn: true,
    };
  }
});
</script>

<template>
  <BalAlert
    v-if="veBalSyncTip"
    :title="veBalSyncTip.title"
    type="tip"
    class="mb-5 w-100"
  >
    <div class="flex items-center">
      <div class="flex-[2]">{{ veBalSyncTip.text }}</div>
      <div v-if="veBalSyncTip.showPokeAllBtn" class="flex flex-1 justify-end">
        <BalBtn color="gradient" @click="$emit('showPokeAllGaugeModal')">
          Poke all gauges
        </BalBtn>
      </div>
      <div v-else-if="!veBalSyncTip.hideBtn" class="flex flex-1 justify-end">
        <BalBtn color="gradient" @click="$emit('showProceedModal')">
          Sync veBAL
        </BalBtn>
      </div>
    </div>
  </BalAlert>
</template>