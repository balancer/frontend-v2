<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import {
  NetworkSyncState,
  useCrossChainSync,
} from '@/providers/cross-chain-sync.provider';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import CheckpointGaugeModal from './CheckpointGaugeModal.vue';
import useWeb3 from '@/services/web3/useWeb3';
import config from '@/lib/config';

type Props = {
  fiatValueOfStakedShares: string;
  fiatValueOfUnstakedShares: string;
};

defineProps<Props>();
const emit = defineEmits(['shouldStakingCardBeOpened']);
const shouldShowWarningAlert = ref(false);
const showCheckpointModal = ref(false);

const { networksSyncState, getGaugeWorkingBalance } = useCrossChainSync();
const { hasNonPrefGaugeBalance, poolGauges, stakedShares } = usePoolStaking();
const { networkId } = useNetwork();
const { isMismatchedNetwork } = useWeb3();

const tipText = computed(() => {
  if (hasNonPrefGaugeBalance.value) {
    const title = 'Restake to be eligible for future incentives';
    let text = '';
    if (
      networksSyncState.value[networkId.value] === NetworkSyncState.Unsynced
    ) {
      text = `After your veBAL syncs to ${
        config[networkId.value].chainName
      }, restake to move from the deprecated pool gauge to the new boost-aware pool gauge. If you restake before the veBAL syncs, you’ll need to perform another interaction on the gauge to start receiving your staking boost.`;
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

  return null;
});

const warningAlert = computed(() => {
  if (shouldShowWarningAlert.value) {
    return {
      title: 'You are not getting your max staking boost',
      text: 'You’ve synced new veBAL but it is not being used to increase your staking boost (since pool gauges don’t automatically recognize veBAL changes). Interact with a pool gauge to trigger an update (e.g. by claiming BAL, staking/unstaking or explicitly triggering an update).',
    };
  }
  return null;
});

async function setWarningAlertState() {
  if (isMismatchedNetwork.value) {
    return;
  }

  if (Number(stakedShares.value) === 0) {
    return;
  }

  const id = poolGauges.value?.pool.preferentialGauge.id;

  if (!id) {
    return;
  }

  try {
    emit('shouldStakingCardBeOpened');

    const balance = await getGaugeWorkingBalance(id);

    // if the second number it returns is greater than the first, then show the message
    if (balance[1]?.gt(balance[0])) {
      shouldShowWarningAlert.value = true;
    }
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  setWarningAlertState();
});
</script>

<template>
  <div class="flex">
    <BalAlert
      v-if="warningAlert"
      class="flex-grow"
      type="warning"
      :title="warningAlert.title"
    >
      <div class="flex flex-col">
        <span class="mb-3">{{ warningAlert.text }}</span>
        <div class="mb-2">
          <BalBtn
            size="sm"
            color="gradient"
            @click="showCheckpointModal = true"
          >
            Trigger update
          </BalBtn>
        </div>
      </div>
    </BalAlert>

    <BalAlert
      v-else-if="tipText"
      class="flex-grow"
      type="tip"
      :title="tipText.title"
    >
      {{ tipText.text }}
    </BalAlert>

    <CheckpointGaugeModal
      :isVisible="showCheckpointModal"
      @close="showCheckpointModal = false"
      @success="shouldShowWarningAlert = false"
    />
  </div>
</template>