<script lang="ts" setup>
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { format, formatDistanceToNow } from 'date-fns';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BalForm from '@/components/_global/BalForm/BalForm.vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  dateTimeLabelFor,
  toJsTimestamp,
  toUtcTime,
} from '@/composables/useTime';
import useTransactions from '@/composables/useTransactions';
import useVeBal from '@/composables/useVeBAL';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { VEBAL_VOTING_GAUGE } from '@/constants/voting-gauges';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { isPositive } from '@/lib/utils/validations';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { WalletError } from '@/types';
import { TransactionActionState } from '@/types/transactions';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingGauges from '@/composables/useVotingGauges';
import { orderedPoolTokens } from '@/composables/usePool';

/**
 * TYPES
 */

/**
 * PROPS & EMITS
 */

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * COMPOSABLES
 */
const { poolsUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();
const { votingGauges: allVotingGauges } = useVotingGauges();

/**
 * STATE
 */
const inputs = ref({});

/**
 * COMPUTED
 */
const votingGauges = computed(() =>
  allVotingGauges.value.filter(gauge => {
    return poolsUsingUnderUtilizedVotingPower.value.includes(gauge.address);
  })
);

/**
 * METHODS
 */
// TODO: Refactor
function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
}

/**
 * LIFECYCLE
 */
onMounted(() => {
  if (hasVotes.value) voteWeight.value = currentWeightNormalized.value;
});
</script>

<template>
  <BalModal show @close="emit('close')">
    <template #header>
      <div class="flex items-center">
        <h4>Preview vote resubmission</h4>
      </div>
    </template>
    <div>
      <div v-for="gauge in votingGauges" :key="gauge.address">
        <BalAssetSet
          :logoURIs="orderedTokenURIs(gauge)"
          :width="100"
          :size="32"
        />
        <div v-for="token in gauge.pool.tokens" :key="token.address">
          {{
            !!Number(token.weight) ? `${Number(token.weight) * 100}%` : '100%'
          }}
          {{ token.symbol }}
        </div>
        <div>
          {{ gauge.pool.symbol }}
        </div>
        <BalTextInput
          v-model="inputs[gauge.address]"
          type="number"
          name="poolName"
          inputAlignRight
        />
      </div>

      <div class="mt-4">
        <BalBtn color="gradient" block> Confirm votes </BalBtn>
      </div>
    </div>
  </BalModal>
</template>
