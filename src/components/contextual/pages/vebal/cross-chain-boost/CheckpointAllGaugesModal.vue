<script setup lang="ts">
import useTransactions from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import useEthers from '@/composables/useEthers';

interface Props {
  isVisible?: boolean;
  shouldPokePoolsMap: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['close', 'success']);

const { checkpointAllGauges } = useUserStaking();
const { addTransaction } = useTransactions();
const { isMismatchedNetwork } = useWeb3();
const { txListener } = useEthers();

const showCloseBtn = ref(false);

async function pokeAllGauges() {
  try {
    const tx = await checkpointAllGauges(
      Object.values(props.shouldPokePoolsMap)
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'userGaugeCheckpoint',
      summary: '',
    });

    await txListener(tx, {
      onTxConfirmed: async () => {
        emit('success');
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
    label: 'Poke all gauges',
    loadingLabel: 'Confirm poke in wallet',
    confirmingLabel: 'Confirming poke',
    action: async () => {
      return pokeAllGauges();
    },
    stepTooltip: '',
  },
];
</script>

<template>
  <BalModal
    :show="isVisible"
    :disabled="isMismatchedNetwork"
    title="Poke all gauges to get boosted APRs"
    @close="emit('close')"
  >
    <div class="flex flex-col justify-between">
      <div class="mb-12">
        <span class="mb-3">
          Even after syncing veBAL to an L2, pool gauges remains unaware of your
          new balance until interacted with. This means, you are currently
          missing out on your maximum possible boost.
        </span>
        <span>
          ‘Poke gauge’ to gas-efficiently update the gauge with your new veBAL
          balance. Otherwise, interact with a gauge to trigger the update. If
          you already have accumulated some incentives, ‘Claim BAL’ to get your
          incentives and trigger the update for future boosts.
        </span>
      </div>

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
