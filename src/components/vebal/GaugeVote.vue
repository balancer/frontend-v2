<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import { DecoratedPoolWithGaugeShares } from '@/services/balancer/subgraph/types';
import { scale, bnum } from '@/lib/utils';
import BalForm from '../_global/BalForm/BalForm.vue';
import BalTextInput from '../_global/BalTextInput/BalTextInput.vue';
import { gaugeControllerService } from '@/services/contracts/gauge-controller.service';
import { BigNumber } from '@ethersproject/bignumber';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPoolWithGaugeShares;
  unallocatedVoteWeight: number;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * STATE
 */

const voteWeight = ref<string>('');

/**
 * COMPUTED
 */
const voteDisabled = computed(() => false); // Make disabled when not a valid number
const currentWeight = computed(() => props.pool.gauge.userVotes);
const voteButtonText = computed(() =>
  currentWeight.value > 0
    ? t('veBAL.liquidityMining.popover.button.edit')
    : t('veBAL.liquidityMining.popover.button.vote')
);

/**
 * METHODS
 */
function submitVote() {
  const totalVoteShares = scale(voteWeight.value, 2).toString();
  gaugeControllerService.voteForGaugeWeights(
    props.pool.gauge.address,
    BigNumber.from(totalVoteShares)
  );
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
          >
            <template v-slot:append>
              %
            </template>
          </BalTextInput>
          <div class="">
            Unallocated Votes:
            {{
              fNum2(
                scale(bnum(props.unallocatedVoteWeight), -4).toString(),
                FNumFormats.percent
              )
            }}
          </div>
          <BalBtn
            color="gradient"
            class="mt-6"
            block
            :disabled="voteDisabled"
            @click.prevent="submitVote"
            >{{ voteButtonText }}</BalBtn
          >
        </BalForm>
      </div>
    </BalCard>
  </BalPopover>
</template>
