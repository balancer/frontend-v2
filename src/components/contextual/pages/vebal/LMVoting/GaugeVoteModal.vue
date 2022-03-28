<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, formatDistanceToNow } from 'date-fns';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';

import { scale, bnum } from '@/lib/utils';
import { WalletError } from '@/types';
import { TransactionActionState } from '@/types/transactions';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';

import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import {
  dateTimeLabelFor,
  toJsTimestamp,
  toUtcTime
} from '@/composables/useTime';
import useVeBal from '@/composables/useVeBAL';

import BalForm from '@/components/_global/BalForm/BalForm.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import { isGreaterThan, isPositive } from '@/lib/utils/validations';

/**
 * TYPES
 */
type Props = {
  gauge: VotingGaugeWithVotes;
  unallocatedVoteWeight: number;
  logoURIs: string[];
  poolURL: string;
  veBalLockInfo?: VeBalLockInfo;
};

const MINIMUM_LOCK_TIME = 86_400_000 * 7;

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
  const lastUserVoteTime = toJsTimestamp(props.gauge.lastUserVoteTime);
  if (Date.now() < lastUserVoteTime + WEIGHT_VOTE_DELAY) {
    const remainingTime = formatDistanceToNow(
      lastUserVoteTime + WEIGHT_VOTE_DELAY
    );
    return {
      title: t('veBAL.liquidityMining.popover.warnings.votedTooRecently.title'),
      description: t(
        'veBAL.liquidityMining.popover.warnings.votedTooRecently.description',
        [remainingTime]
      )
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
    description: t('veBAL.liquidityMining.popover.warnings.noVeBal.description')
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
        )
      };
    }
  }

  return null;
});

const voteWarning = computed((): {
  title: string;
  description: string;
} | null => {
  if (votedToRecentlyWarning.value) return votedToRecentlyWarning.value;
  if (noVeBalWarning.value) return noVeBalWarning.value;
  if (veBalLockTooShortWarning.value) return veBalLockTooShortWarning.value;
  return null;
});

const voteError = computed(() => {
  if (voteState.error) return voteState.error;
  return null;
});

const transactionInProgress = computed(
  (): boolean => voteState.init || voteState.confirming
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
  v => !v || isVoteWeightValid(v) || '',
  isPositive(),
  isGreaterThan(0)
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
      props.gauge.pool.symbol
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
  <BalModal show :fireworks="voteState.confirmed" @close="emit('close')">
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle
          v-if="voteState.confirmed"
          size="8"
          color="green"
          class="text-white mr-2"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ voteTitle }}
        </h4>
      </div>
    </template>
    <div>
      <div class="mb-4 text-sm" v-if="!voteWarning">
        {{ t('veBAL.liquidityMining.popover.emissionsInfo') }}
      </div>
      <BalAlert
        v-if="voteWarning"
        type="warning"
        :title="voteWarning.title"
        :description="voteWarning.description"
        class="w-full rounded mb-4"
      />

      <div
        class="border dark:border-gray-800 p-2 rounded-lg mb-4 flex items-center justify-between"
      >
        <div class="flex items-center h-full">
          <BalAssetSet :logoURIs="logoURIs" :width="100" :size="32" />
          <span class="text-gray-500">{{ gauge.pool.symbol }}</span>
        </div>
        <BalLink
          :href="poolURL"
          external
          noStyle
          class="flex items-center group"
        >
          <BalIcon
            name="arrow-up-right"
            class="text-gray-500 group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <BalForm>
        <BalTextInput
          name="voteWeight"
          type="number"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          step="any"
          v-model="voteWeight"
          validateOn="input"
          :rules="inputRules"
          :disabled="
            !!voteWarning || transactionInProgress || voteState.receipt
          "
          size="sm"
          autoFocus
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
        <div class="mt-4">
          <template v-if="voteState.receipt">
            <ConfirmationIndicator
              :txReceipt="voteState.receipt"
              class="mb-2"
            />
            <BalBtn
              v-if="voteState.receipt"
              color="gray"
              outline
              block
              @click="emit('close')"
            >
              {{ $t('getVeBAL.previewModal.returnToVeBalPage') }}
            </BalBtn>
          </template>
          <BalBtn
            v-else
            color="gradient"
            block
            :disabled="voteDisabled"
            :loading="transactionInProgress"
            :loading-label="
              voteState.init
                ? $t('veBAL.liquidityMining.popover.actions.vote.loadingLabel')
                : $t('veBAL.liquidityMining.popover.actions.vote.confirming')
            "
            @click.prevent="submitVote"
          >
            {{ voteButtonText }}
          </BalBtn>
        </div>
      </BalForm>
      <div class="text-gray-500 text-sm mt-4" v-if="!voteWarning">
        {{
          t('veBAL.liquidityMining.popover.voteLockInfo', [voteLockedUntilText])
        }}
      </div>
    </div>
  </BalModal>
</template>
