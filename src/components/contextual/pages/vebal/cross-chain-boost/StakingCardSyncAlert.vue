<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import {
  NetworkSyncState,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

type Props = {
  fiatValueOfStakedShares: string;
  fiatValueOfUnstakedShares: string;
};

const props = defineProps<Props>();

const { l2VeBalBalances, networksSyncState } = useCrossChainSync();
const { hasNonPrefGaugeBalance } = usePoolStaking();
const { networkId } = useNetwork();

const tipText = computed(() => {
  if (hasNonPrefGaugeBalance.value) {
    const title = 'Restake to be eligible for future incentives';
    let text = '';
    if (
      networksSyncState.value[networkId.value] === NetworkSyncState.Unsynced
    ) {
      text =
        'After your veBAL syncs to [Arbitrum], restake to move from the deprecated pool gauge to the new boost-aware pool gauge. If you restake before the veBAL syncs, you’ll need to perform another interaction on the gauge to start receiving your staking boost.';
    }

    if (networksSyncState.value[networkId.value] === NetworkSyncState.Synced) {
      text =
        'To get your staking boost on this pool, restake to move from the deprecated pool gauge to the new boost-aware pool gauge.';
    }

    return {
      title,
      text,
    };
  }

  return {
    title: '',
    text: '',
  };
});

const warningAlert = computed(() => {
  if (networksSyncState.value[networkId.value] === NetworkSyncState.Synced) {
    return {
      title: 'You are missing out on your max staking boost',
      text: 'You’ve synced new veBAL but it is not being used to increase your staking boost (since pool gauges don’t automatically recognize veBAL changes). Interact with a pool gauge to trigger an update (e.g. by claiming BAL, staking/unstaking or explicitly triggering an update).',
    };
  }
  return {
    title: '',
    text: '',
  };
});
</script>

<template>
  <div class="flex">
    <BalAlert
      v-if="warningAlert.title"
      class="flex-grow"
      type="warning"
      :title="warningAlert.title"
    >
      <div class="flex flex-col">
        <span class="mb-1">{{ warningAlert.text }}</span>
        <BalBtn size="sm" color="gradient"> Trigger update </BalBtn>
      </div>
    </BalAlert>

    <BalAlert
      v-else-if="tipText.title"
      class="flex-grow"
      type="tip"
      :title="tipText.title"
    >
      {{ tipText.text }}
    </BalAlert>
  </div>
</template>