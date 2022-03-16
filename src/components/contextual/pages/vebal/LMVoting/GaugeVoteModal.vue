<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';

import useWeb3 from '@/services/web3/useWeb3';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useConfig from '@/composables/useConfig';
import useVeBal from '@/composables/useVeBAL';

import { scale, bnum } from '@/lib/utils';
import BalForm from '@/components/_global/BalForm/BalForm.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';

import { TransactionActionState } from '@/types/transactions';
import { WalletError } from '@/types';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';

/**
 * TYPES
 */
type Props = {
  gauge: VotingGaugeWithVotes;
  unallocatedVoteWeight: number;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * COMPOSABLES
 */
const { explorerLinks } = useWeb3();
const { networkConfig } = useConfig();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { veBalBalance } = useVeBal();

/**
 * STATE
 */
const voteWeight = ref<string>('');
const voteState = reactive<TransactionActionState>({
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: ''
});

/**
 * COMPUTED
 */
const voteDisabled = computed(
  () => !!voteWarning.value || !hasEnoughVotes.value
);

const currentWeight = computed(() => props.gauge.userVotes);
const currentWeightNormalized = computed(() =>
  scale(bnum(currentWeight.value), -2).toString()
);
const hasVotes = computed((): boolean => bnum(currentWeight.value).gt(0));

const voteTitle = computed(() =>
  hasVotes.value
    ? t('veBAL.liquidityMining.popover.title.edit')
    : t('veBAL.liquidityMining.popover.title.vote')
);

const voteButtonText = computed(() =>
  hasVotes.value
    ? t('veBAL.liquidityMining.popover.button.edit')
    : t('veBAL.liquidityMining.popover.button.vote')
);

const votedToRecentlyWarning = computed(() => {
  const timestampSeconds = Date.now() / 1000;
  const lastUserVote = props.gauge.lastUserVote;
  if (timestampSeconds < lastUserVote + WEIGHT_VOTE_DELAY) {
    const remainingTime = formatDistanceToNow(
      (lastUserVote + WEIGHT_VOTE_DELAY) * 1000
    );
    return t('veBAL.liquidityMining.popover.warnings.votedTooRecently', [
      remainingTime
    ]);
  }
  return null;
});

const noVeBalWarning = computed(() => {
  if (Number(veBalBalance.value) > 0) {
    return null;
  }
  return t('veBAL.liquidityMining.popover.warnings.noVeBal');
});

const voteWarning = computed(() => {
  if (votedToRecentlyWarning.value) return votedToRecentlyWarning.value;
  if (noVeBalWarning.value) return noVeBalWarning.value;
  return null;
});

const voteError = computed(() => {
  if (voteState.error) return voteState.error;
  return null;
});

const explorerLink = computed((): string =>
  voteState.receipt
    ? explorerLinks.txLink(voteState.receipt.transactionHash)
    : ''
);

const transactionInProgress = computed(
  (): boolean => voteState.init || voteState.confirming
);

const hasEnoughVotes = computed((): boolean => {
  return isVoteWeightValid(voteWeight.value);
});

const unallocatedVotesNormalized = computed((): string =>
  scale(bnum(props.unallocatedVoteWeight), -2).toString()
);

const unallocatedVotesFormatted = computed((): string =>
  fNum2(
    scale(bnum(props.unallocatedVoteWeight), -4).toString(),
    FNumFormats.percent
  )
);

const unallocatedVotesClass = computed(() => {
  return hasEnoughVotes.value ? ['text-gray-500'] : ['text-red-600'];
});

const remainingVotes = computed(() => {
  let remainingVotesText;
  if (!hasEnoughVotes.value) {
    remainingVotesText = 'veBAL.liquidityMining.popover.remainingVotesExceeded';
  } else {
    remainingVotesText = hasVotes.value
      ? 'veBAL.liquidityMining.popover.remainingVotesEditing'
      : 'veBAL.liquidityMining.popover.remainingVotes';
  }
  const remainingVotesFormatted = fNum2(
    scale(
      bnum(props.unallocatedVoteWeight).plus(bnum(currentWeight.value)),
      -4
    ).toString(),
    FNumFormats.percent
  );
  const currentVotesFormatted = fNum2(
    scale(bnum(currentWeight.value), -4).toString(),
    FNumFormats.percent
  );
  return t(remainingVotesText, [
    remainingVotesFormatted,
    currentVotesFormatted,
    unallocatedVotesFormatted.value
  ]);
});

const inputRules = [
  value => {
    if (value !== '' && isNaN(Number(value))) return '';
    if (isVoteWeightValid(value)) return;
    return '';
  }
];

/**
 * METHODS
 */
function isVoteWeightValid(voteWeight) {
  if (voteWeight === '') return true;
  const currentValue = scale(voteWeight, 2).toNumber();
  const isValid =
    currentValue <= props.unallocatedVoteWeight + Number(currentWeight.value);
  return isValid;
}

async function submitVote() {
  const totalVoteShares = scale(voteWeight.value, 2).toString();
  try {
    voteState.init = true;
    voteState.error = null;
    const tx = await gaugeControllerService.voteForGaugeWeights(
      props.gauge.address,
      BigNumber.from(totalVoteShares)
    );
    voteState.init = false;
    voteState.confirming = true;
    handleTransaction(tx);
  } catch (e) {
    console.error(e);
    const error = e as WalletError;
    voteState.init = false;
    voteState.confirming = false;
    voteState.error = {
      title: 'Vote Failed',
      description: error.message
    };
  }
}

async function handleTransaction(tx) {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'voteForGauge',
    summary: t('veBAL.liquidityMining.popover.voteForGauge', [
      fNum2(scale(voteWeight.value, -2).toString(), FNumFormats.percent),
      'pool'
    ]),
    details: {
      voteWeight: voteWeight.value
    }
  });

  txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      voteState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      voteState.confirmedAt = dateTimeLabelFor(confirmedAt);
      voteState.confirmed = true;
      voteState.confirming = false;
      emit('success');
    },
    onTxFailed: () => {
      console.error('Vote failed');
      voteState.error = {
        title: 'Vote Failed',
        description: 'Vote failed for an unknown reason'
      };
      voteState.confirming = false;
    }
  });
}

/**
 * LIFECYCLE
 */
onMounted(() => {
  if (hasVotes.value) voteWeight.value = currentWeightNormalized.value;
});
</script>

<template>
  <BalModal show :fireworks="false" @close="emit('close')">
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle v-if="false" size="8" color="green" class="text-white mr-2">
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ voteTitle }}
        </h4>
      </div>
    </template>
    <div>
      <div v-if="voteWarning" class="pb-2 text-sm text-yellow-500">
        {{ voteWarning }}
      </div>
      <BalForm>
        <BalTextInput
          name="voteWeight"
          v-model="voteWeight"
          :placeholder="unallocatedVotesNormalized"
          validateOn="input"
          :rules="inputRules"
          :disabled="voteDisabled"
          size="sm"
        >
          <template v-slot:append>
            <div class="h-full flex flex-row justify-center items-center px-2">
              <span class="text-gray-500">%</span>
            </div>
          </template>
        </BalTextInput>
        <div :class="['mt-2 text-sm'].concat(unallocatedVotesClass)">
          {{ remainingVotes }}
        </div>
        <BalAlert
          v-if="voteError"
          type="error"
          :title="voteError.title"
          :description="voteError.description"
          block
          class="mt-2"
        />
        <BalBtn
          color="gradient"
          class="mt-4"
          block
          :disabled="voteDisabled"
          :loading="transactionInProgress"
          :loading-label="
            voteState.init
              ? $t('veBAL.liquidityMining.popover.actions.vote.loadingLabel')
              : $t('veBAL.liquidityMining.popover.actions.vote.confirming')
          "
          @click.prevent="submitVote"
          >{{ voteButtonText }}</BalBtn
        >
        <BalLink
          v-if="voteState.receipt"
          :href="explorerLink"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </BalForm>
    </div>
  </BalModal>
</template>
