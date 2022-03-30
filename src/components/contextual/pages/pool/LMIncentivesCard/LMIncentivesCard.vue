<script setup lang="ts">
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { configService } from '@/services/config/config.service';
import LiquidityMiningDistributions from '@/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
import { last } from 'lodash';

type Props = {
  poolId: string;
};

const props = defineProps<Props>();

const latestWeek = last(Object.keys(LiquidityMiningDistributions)) as string;
const relevantDistribution = LiquidityMiningDistributions[latestWeek].find(
  distribution => distribution.chainId === configService.network.chainId
);

const isEligibleForLM = (relevantDistribution.pools[props.poolId] || []).some(
  token => token.amount > 0
);
</script>

<template>
  <AnimatePresence isVisible>
    <BalAccordion
      class="shadow-2xl rounded-xl"
      :sections="[
        {
          title: $t('liquidityMiningIncentives'),
          id: 'lm-incentives',
          handle: 'lm-handle',
          isDisabled: !isEligibleForLM
        }
      ]"
    >
      <template v-slot:lm-handle>
        <button
          class="p-4 rounded-xl w-full hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <BalStack horizontal justify="between" align="center">
            <BalStack spacing="sm" align="center">
              <div
                :class="[
                  'flex items-center p-1 text-white rounded-full',
                  {
                    'bg-green-500': isEligibleForLM,
                    'bg-gray-400': !isEligibleForLM
                  }
                ]"
              >
                <BalIcon size="sm" name="check" v-if="isEligibleForLM" />
                <BalIcon size="sm" name="x" v-else />
              </div>
              <h6>{{ $t('liquidityMiningIncentives') }}</h6>
            </BalStack>
            <BalStack horizontal spacing="sm" align="center">
              <BalIcon
                name="chevron-down"
                class="text-blue-500"
                v-if="isEligibleForLM"
              />
            </BalStack>
          </BalStack>
        </button>
      </template>
      <template v-slot:lm-incentives>
        <div class="p-4">
          <p>
            {{
              $t('liquidityMiningIncentivesCopy', [
                configService.network.shortName
              ])
            }}
          </p>
        </div>
      </template>
    </BalAccordion>
  </AnimatePresence>
</template>
