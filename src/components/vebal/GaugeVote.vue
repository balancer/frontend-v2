<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { isStablePhantom, isWstETH } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/poolAPR';

import { DecoratedPoolWithGaugeShares } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import BalForm from '../_global/BalForm/BalForm.vue';
import BalTextInput from '../_global/BalTextInput/BalTextInput.vue';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPoolWithGaugeShares;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const voteDisabled = computed(() => false); // Make disabled when not a valid number

/**
 * METHODS
 */
function submitVote() {
  gaugeControllerService.voteForGaugeWeights(
    props.pool.gauge.address,
    BigNumber.from('1')
  );
}
</script>

<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn color="transparent" :size="'sm'" class="mr-2 p-1 relative" flat>
        <VoteIcon />
      </BalBtn>
    </template>
    <BalCard class="w-72" noPad noBorder>
      <template v-slot:header>
        <div
          class="p-3 w-full flex items-center justify-between border-b dark:border-gray-900"
        >
          <h5>{{ $t('voteWeight') }}</h5>
        </div>
      </template>
      <div :class="['p-3']">
        <BalForm>
          <BalTextInput format="number" placeholder="100">
            <template v-slot:append>
              %
            </template>
          </BalTextInput>
          <div class="">Unallocated Votes:</div>
          <BalBtn
            color="gradient"
            class="mt-6"
            block
            :disabled="voteDisabled"
            @click.prevent="submitVote"
            >Vote</BalBtn
          >
        </BalForm>
      </div>
    </BalCard>
  </BalPopover>
</template>
