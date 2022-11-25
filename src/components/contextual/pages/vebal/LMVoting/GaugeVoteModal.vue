<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { format } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BalForm from '@/components/_global/BalForm/BalForm.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { dateTimeLabelFor, toUtcTime } from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import useVeBal, {
  isVotingTimeLocked,
  remainingVoteLockTime,
} from '@/composables/useVeBAL';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { VEBAL_VOTING_GAUGE } from '@/constants/voting-gauges';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { isPositive } from '@/lib/utils/validations';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { WalletError } from '@/types';
import SubmitVoteBtn from './SubmitVoteBtn.vue';
import useActionState, { State } from '@/composables/useActionState';

/**
 * TYPES
 */
type Props = {
  gauge: VotingGaugeWithVotes;
  unallocatedVoteWeight: number;
  logoURIs: string[];
  poolURL: string;
  veBalLockInfo?: VeBalLockInfo | null;
};

const MINIMUM_LOCK_TIME = 86_400_000 * 7;

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  veBalLockInfo: null,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { veBalBalance } = useVeBal();
const voteState = useActionState();

/**
 * STATE
 */
const voteWeight = ref<string>('');

/**
 * COMPUTED
 */
const voteButtonDisabled = computed((): boolean => {
  if (isVeBalGauge.value) {
    return !!voteError.value || !hasEnoughVotes.value;
  }

  return !!voteError.value || !hasEnoughVotes.value;
});

const voteInputDisabled = computed((): boolean => {
  return !!voteError.value;
});

const currentWeight = computed(() => props.gauge.userVotes);
const currentWeightNormalized = computed(() =>
  scale(bnum(currentWeight.value), -2).toString()
);
const hasVotes = computed((): boolean => bnum(currentWeight.value).gt(0));

const isVeBalGauge = computed((): boolean =>
  isSameAddress(props.gauge.address, VEBAL_VOTING_GAUGE?.address || '')
);

// Is votes next period value above voting cap?
const votesNextPeriodOverCap = computed((): boolean => {
  if (!isVeBalGauge.value && props.gauge.relativeWeightCap === 'null')
    return false;
  const gaugeVoteWeightNormalized = scale(props.gauge.votesNextPeriod, -18);
  return gaugeVoteWeightNormalized.gte(
    bnum(isVeBalGauge.value ? '0.1' : props.gauge.relativeWeightCap)
  );
});

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
  if (isVotingTimeLocked(props.gauge.lastUserVoteTime)) {
    const remainingTime = remainingVoteLockTime(props.gauge.lastUserVoteTime);
    return {
      title: t('veBAL.liquidityMining.popover.warnings.votedTooRecently.title'),
      description: t(
        'veBAL.liquidityMining.popover.warnings.votedTooRecently.description',
        [remainingTime]
      ),
    };
  }
  return null;
});

const voteLockedUntilText = computed<string>(() => {
  const unlockTime = Date.now() + WEIGHT_VOTE_DELAY;
  return format(toUtcTime(new Date(unlockTime)), 'd LLLL y');
});

const noVeBalWarning = computed(() => {
  if (Number(veBalBalance.value) > 0) {
    return null;
  }
  return {
    title: t('veBAL.liquidityMining.popover.warnings.noVeBal.title'),
    description: t(
      'veBAL.liquidityMining.popover.warnings.noVeBal.description'
    ),
  };
});

const veBalLockTooShortWarning = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    const lockEndDate = props.veBalLockInfo.lockedEndDate;
    if (lockEndDate < Date.now() + MINIMUM_LOCK_TIME) {
      return {
        title: t(
          'veBAL.liquidityMining.popover.warnings.veBalLockTooShort.title'
        ),
        description: t(
          'veBAL.liquidityMining.popover.warnings.veBalLockTooShort.description'
        ),
      };
    }
  }

  return null;
});

const lpVoteOverLimitWarning = computed(() => {
  if (votesNextPeriodOverCap.value) {
    if (isVeBalGauge.value) {
      return {
        title: t(
          'veBAL.liquidityMining.popover.warnings.veBalVoteOverLimitWarning.title'
        ),
        description: t(
          'veBAL.liquidityMining.popover.warnings.veBalVoteOverLimitWarning.description'
        ),
      };
    } else {
      return {
        title: t(
          'veBAL.liquidityMining.popover.warnings.lpVoteOverLimitWarning.title'
        ),
        description: t(
          'veBAL.liquidityMining.popover.warnings.lpVoteOverLimitWarning.description',
          [(Number(props.gauge.relativeWeightCap) * 100).toFixed()]
        ),
      };
    }
  }

  return null;
});

const voteWarning = computed(
  (): {
    title: string;
    description: string;
  } | null => {
    if (lpVoteOverLimitWarning.value) return lpVoteOverLimitWarning.value;
    if (voteState.error.value) return voteState.error.value;
    return null;
  }
);

const voteError = computed(
  (): {
    title: string;
    description: string;
  } | null => {
    if (votedToRecentlyWarning.value) return votedToRecentlyWarning.value;
    if (noVeBalWarning.value) return noVeBalWarning.value;
    if (veBalLockTooShortWarning.value) return veBalLockTooShortWarning.value;
    return null;
  }
);

const transactionInProgress = computed(
  (): boolean =>
    voteState.state.value === State.TRANSACTION_INITIALIZED ||
    voteState.state.value === State.CONFIRMING
);

const hasEnoughVotes = computed((): boolean => {
  return isVoteWeightValid(voteWeight.value);
});

const unallocatedVotesFormatted = computed((): string =>
  fNum2(
    scale(bnum(props.unallocatedVoteWeight), -4).toString(),
    FNumFormats.percent
  )
);

const unallocatedVotesClass = computed(() => {
  return hasEnoughVotes.value
    ? ['text-gray-600 dark:text-gray-400']
    : ['text-red-600'];
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
    unallocatedVotesFormatted.value,
  ]);
});

const inputRules = [v => !v || isVoteWeightValid(v) || '', isPositive()];

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
    voteState.setInit();
    const tx = await gaugeControllerService.voteForGaugeWeights(
      props.gauge.address,
      BigNumber.from(totalVoteShares)
    );
    voteState.setConfirming();
    handleTransaction(tx);
  } catch (e) {
    console.error(e);
    const error = e as WalletError;

    voteState.setError({
      title: 'Vote failed',
      description: error.message,
    });
  }
}

async function handleTransaction(tx) {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'voteForGauge',
    summary: t('veBAL.liquidityMining.popover.voteForGauge', [
      fNum2(scale(voteWeight.value, -2).toString(), FNumFormats.percent),
      props.gauge.pool.symbol,
    ]),
    details: {
      voteWeight: voteWeight.value,
    },
  });

  txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      const confirmedAt = dateTimeLabelFor(await getTxConfirmedAt(receipt));

      voteState.setSuccess({ receipt, confirmedAt });
      emit('success');
    },
    onTxFailed: () => {
      console.error('Vote failed');
      voteState.setError({
        title: 'Vote Failed',
        description: 'Vote failed for an unknown reason',
      });
    },
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
  <BalModal
    show
    :fireworks="voteState.state.value === State.CONFIRMED"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="voteState.state.value === State.CONFIRMED"
          size="8"
          color="green"
          class="mr-2 text-white"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ voteTitle }}
        </h4>
      </div>
    </template>
    <div>
      <div v-if="!voteWarning" class="mb-4 text-sm">
        <ul class="ml-4 list-disc text-gray-600 dark:text-gray-400">
          <li class="mb-1">
            {{ t('veBAL.liquidityMining.popover.emissionsInfo') }}
          </li>
          <li class="mb-1">
            {{ t('veBAL.liquidityMining.popover.resubmitVote') }}
          </li>
          <li>
            {{
              t('veBAL.liquidityMining.popover.voteLockInfo', [
                voteLockedUntilText,
              ])
            }}
          </li>
        </ul>
      </div>
      <BalAlert
        v-if="voteWarning"
        type="warning"
        :title="voteWarning.title"
        :description="voteWarning.description"
        class="mb-4 w-full rounded"
      />
      <BalAlert
        v-if="voteError"
        type="error"
        :title="voteError.title"
        :description="voteError.description"
        block
        class="mt-2 mb-4"
      />

      <div
        class="flex justify-between items-center p-2 mb-4 rounded-lg border dark:border-gray-800"
      >
        <div class="flex gap-4 items-center h-full">
          <BalAssetSet :logoURIs="logoURIs" :width="100" :size="32" />
          <div>
            <p class="font-medium text-black dark:text-white">
              {{ gauge.pool.symbol }}
            </p>
          </div>
        </div>
        <BalLink
          :href="poolURL"
          external
          noStyle
          class="group flex items-center"
        >
          <BalIcon
            name="arrow-up-right"
            class="text-gray-500 group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <BalForm class="vote-form">
        <BalTextInput
          v-model="voteWeight"
          name="voteWeight"
          type="number"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          step="any"
          placeholder="0"
          validateOn="input"
          :rules="inputRules"
          :disabled="
            voteInputDisabled ||
            transactionInProgress ||
            voteState.state.value === State.CONFIRMED
          "
          size="md"
          autoFocus
        >
          <template #append>
            <div
              class="flex flex-row justify-center items-center px-2 h-full rounded-r-lg border-gray-100 dark:border-gray-800"
            >
              <span class="text-xl text-black dark:text-white">%</span>
            </div>
          </template>
        </BalTextInput>
        <div v-if="voteError" class="mt-2 text-sm text-secondary">
          {{
            t('veBAL.liquidityMining.popover.warnings.noVeBal.inputHintText')
          }}
        </div>
        <div v-else :class="['mt-2 text-sm'].concat(unallocatedVotesClass)">
          {{ remainingVotes }}
        </div>

        <SubmitVoteBtn
          :disabled="voteButtonDisabled"
          :loading="transactionInProgress"
          class="mt-4"
          :loadingLabel="
            voteState.state.value === State.TRANSACTION_INITIALIZED
              ? $t('veBAL.liquidityMining.popover.actions.vote.loadingLabel')
              : $t('veBAL.liquidityMining.popover.actions.vote.confirming')
          "
          @click:close="emit('close')"
          @click:submit="submitVote"
        >
          {{ voteButtonText }}
        </SubmitVoteBtn>
      </BalForm>
    </div>
  </BalModal>
</template>
