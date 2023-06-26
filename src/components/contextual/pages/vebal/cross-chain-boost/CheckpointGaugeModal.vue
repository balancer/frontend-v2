<script setup lang="ts">
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';
import useTransactions from '@/composables/useTransactions';

interface Props {
  isVisible?: boolean;
}

withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close']);

const { poolGauges } = usePoolStaking();
const { triggerGaugeUpdate } = useCrossChainSync();
const { addTransaction } = useTransactions();

async function triggerUpdate() {
  try {
    const id = poolGauges.value?.pool.preferentialGauge.id;
    if (!id) {
      throw new Error('No preferential gauge id');
    }

    const tx = await triggerGaugeUpdate(id);

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'userGaugeCheckpoint',
      summary: '',
    });
    return tx;
  } catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}

const actions = [
  {
    label: 'Confirm pool gauge update',
    loadingLabel: '',
    confirmingLabel: 'Confirming pool gauge update',
    action: async () => {
      return triggerUpdate();
    },
    stepTooltip: '',
  },
];
</script>

<template>
  <BalModal
    :show="isVisible"
    title="Trigger pool gauge veBAL update"
    @close="emit('close')"
  >
    <div class="flex flex-col justify-between">
      <span class="mb-12">
        Even though you've synced new veBAL to this Layer 2, it isn’t
        contributing to your staking boost yet on this pool. This is because,
        pool gauges don't detect veBAL changes until you interact with them.
        This transaction is the most gas efficient way to update the gauge but
        you can also trigger the update by claiming any BAL incentives.
      </span>

      <BalActionSteps :actions="actions" />
    </div>
  </BalModal>
</template>
