<script setup lang="ts">
import { ref, computed, reactive, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';

import useWeb3 from '@/services/web3/useWeb3';
import { PoolWithGauge } from '@/services/balancer/subgraph/types';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useConfig from '@/composables/useConfig';

import { scale, bnum } from '@/lib/utils';
import BalForm from '../_global/BalForm/BalForm.vue';
import BalTextInput from '../_global/BalTextInput/BalTextInput.vue';

import { TransactionActionState } from '@/types/transactions';
import { WalletError } from '@/types';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';

/**
 * TYPES
 */
type Props = {
  pool: PoolWithGauge;
  unallocatedVoteWeight: number;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { explorerLinks } = useWeb3();
const { networkConfig } = useConfig();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));

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
const voteDisabled = computed(() => !!votedToRecentlyError.value || notEnoughVotes.value); // Make disabled when not a valid number
const currentWeight = computed(() => props.pool.gauge.userVotes);
const voteButtonText = computed(() =>
  parseFloat(currentWeight.value) > 0
    ? t('veBAL.liquidityMining.popover.button.edit')
    : t('veBAL.liquidityMining.popover.button.vote')
);

const votedToRecentlyError = computed(() => {
  const timestampSeconds = Date.now() / 1000;
  const lastUserVote = props.pool.gauge.lastUserVote;
  if (timestampSeconds < lastUserVote + WEIGHT_VOTE_DELAY) {
    const remainingTime = formatDistanceToNow(
      (lastUserVote + WEIGHT_VOTE_DELAY) * 1000
    );
    return {
      title: t('veBAL.liquidityMining.popover.errors.votedTooRecently.title'),
      description: t(
        'veBAL.liquidityMining.popover.errors.votedTooRecently.description',
        [remainingTime]
      )
    };
  }
  return null;
})

const voteError = computed(() => {
  if (voteState.error) return voteState.error;
  if (votedToRecentlyError.value) return votedToRecentlyError.value;
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

const notEnoughVotes = computed((): boolean => {
  return (
    props.unallocatedVoteWeight + Number(currentWeight.value) <
    scale(voteWeight.value, 2).toNumber()
  );
});

const unallocatedVotesClass = computed(() => {
  return notEnoughVotes.value ? ['voteError'] : [];
})

/**
 * METHODS
 */
async function submitVote() {
  const totalVoteShares = scale(voteWeight.value, 2).toString();
  try {
    voteState.init = true;
    voteState.error = null;
    const tx = await gaugeControllerService.voteForGaugeWeights(
      props.pool.gauge.address,
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
      poolWeightsLabel(props.pool)
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
</script>

<template>
  <BalPopover detached no-pad>
    <template v-slot:activator>
      <BalBtn color="blue" :outline="true" size="sm" flat>
        {{ $t('veBAL.liquidityMining.table.vote') }}
      </BalBtn>
    </template>
    <BalCard class="w-72" noPad noBorder>
      <template v-slot:header>
        <div
          class="p-3 w-full flex items-center justify-between border-b dark:border-gray-900"
        >
          <h5>{{ $t('veBAL.liquidityMining.popover.title') }}</h5>
        </div>
      </template>
      <div :class="['p-3']">
        <BalForm>
          <BalTextInput
            name="voteWeight"
            v-model="voteWeight"
            placeholder="100"
            :isValid="!notEnoughVotes"
          >
            <template v-slot:append>
              %
            </template>
          </BalTextInput>
          <div :class="unallocatedVotesClass">
            Unallocated Votes:
            {{
              fNum2(
                scale(bnum(props.unallocatedVoteWeight), -4).toString(),
                FNumFormats.percent
              )
            }}
          </div>
          <BalAlert
            v-if="voteError"
            type="error"
            :title="voteError.title"
            :description="voteError.description"
            block
            class="mb-4"
          />
          <BalBtn
            color="gradient"
            class="mt-6"
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
    </BalCard>
  </BalPopover>
</template>

<style scoped>
.voteError {
  color: #DC2626;
}
</style>