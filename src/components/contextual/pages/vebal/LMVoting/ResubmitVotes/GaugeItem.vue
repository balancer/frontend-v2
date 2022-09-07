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
  <div class="special-input">
    <BalTextInput
      :modelValue="modelValue"
      class="mb-3"
      size="auto"
      type="number"
      name="poolName"
      inputAlignRight
      @input="val => emit('update:modelValue', val)"
    >
      <template #prepend>
        <div class="flex gap-3">
          <BalAssetSet
            :logoURIs="orderedTokenURIs(gauge)"
            class="flex-shrink-0"
            :width="100"
            :size="32"
          />
          <div class="flex flex-col">
            <div class="flex flex-row flex-wrap">
              <span
                v-for="(token, i) in gauge.pool.tokens"
                :key="token.address"
                class="flex-shrink-0"
              >
                {{
                  !!Number(token.weight)
                    ? `${Number(token.weight) * 100}%`
                    : '100%'
                }}
                {{ token.symbol
                }}<template v-if="i !== gauge.pool.tokens.length - 1"
                  >,&nbsp;</template
                >
              </span>
            </div>
            <div class="text-sm">
              {{ gauge.pool.symbol }}
            </div>
          </div>
        </div>
      </template>
    </BalTextInput>
  </div>
</template>

<style lang="css" scoped>
.special-input :deep(input) {
  @apply w-14 ml-auto;

  min-width: 3.5rem;
}
</style>
