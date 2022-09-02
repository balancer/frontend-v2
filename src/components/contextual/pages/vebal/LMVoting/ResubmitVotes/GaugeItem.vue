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
type Props = {
  gauge: VotingGaugeWithVotes;
  modelValue?: string;
};
/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/**
 * COMPOSABLES
 */

/**
 * STATE
 */

/**
 * COMPUTED
 */

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
</script>

<template>
  <div>
    <BalAssetSet :logoURIs="orderedTokenURIs(gauge)" :width="100" :size="32" />
    <div v-for="token in gauge.pool.tokens" :key="token.address">
      {{ !!Number(token.weight) ? `${Number(token.weight) * 100}%` : '100%' }}
      {{ token.symbol }}
    </div>
    <div>
      {{ gauge.pool.symbol }}
    </div>
    <BalTextInput
      v-model="modelValue"
      type="number"
      name="poolName"
      inputAlignRight
      @input="val => emit('update:modelValue', val)"
    />
  </div>
</template>
