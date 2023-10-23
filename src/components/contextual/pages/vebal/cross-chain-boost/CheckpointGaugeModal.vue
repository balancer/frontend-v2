<script setup lang="ts">
import useTransactions from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import useEthers from '@/composables/useEthers';

interface Props {
  isVisible: boolean;
  poolAddress: string;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close', 'success']);

const { checkpointGauge, userGaugeShares } = useUserStaking();
const { addTransaction } = useTransactions();
const { isMismatchedNetwork } = useWeb3();
const { txListener } = useEthers();

const showCloseBtn = ref(false);

async function triggerUpdate() {
  try {
    const gauge = userGaugeShares.value?.find(
      gauge => gauge.gauge.poolAddress === props.poolAddress
    );
    const id = gauge?.gauge.id;

    if (!id) {
      throw new Error('No gauge id');
    }

    const tx = await checkpointGauge(id);

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'userGaugeCheckpoint',
      summary: '',
    });

    await txListener(tx, {
      onTxConfirmed: async () => {
        emit('success', props.poolAddress);
      },
      onTxFailed: () => {
        console.error('Tx failed');
      },
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
    loadingLabel: 'Confirming pool gauge update',
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
    :disabled="isMismatchedNetwork"
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

      <BalActionSteps
        :actions="actions"
        primaryActionType="userGaugeCheckpoint"
        @success="showCloseBtn = true"
      />

      <BalBtn
        v-if="showCloseBtn"
        color="gray"
        outline
        block
        @click="$emit('close')"
      >
        {{ $t('close') }}
      </BalBtn>
    </div>
  </BalModal>
</template>
