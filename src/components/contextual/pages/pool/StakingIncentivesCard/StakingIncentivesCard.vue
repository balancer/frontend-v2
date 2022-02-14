<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

type Props = {
  poolId: string;
  // TODO STAKING INTEGRATION
  // remove this after integrating with staking contracts
  // if the pool does not have a gauge, then this component
  // should show the no incentive thing
  hasIncentive: boolean;
};
defineProps<Props>();
/**
 * STATE
 */
// TODO INTEGRATE STAKING APR
const isLoading = ref(false);
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
/**
 * COMPUTED
 */
// TODO INTEGRATE STAKING APR
const apr = computed(() => {
  return 0.1245;
});
/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 4000);
});
</script>

<template>
  <AnimatePresence :isVisible="!isLoading">
    <div class="relative">
      <BalAccordion
        :class="['shadow-2xl', { handle: hasIncentive }]"
        :sections="[
          {
            title: $t('stakingIncentives'),
            id: 'staking-incentives',
            handle: 'staking-handle',
            isDisabled: !hasIncentive
          }
        ]"
      >
        <template v-slot:staking-handle>
          <button class="p-4 rounded-xl w-full">
            <BalStack horizontal justify="between" align="center">
              <BalStack spacing="sm" align="center">
                <div
                  :class="[
                    'flex items-center p-1 text-white rounded-full',
                    {
                      'bg-green-500': hasIncentive,
                      'bg-gray-400': !hasIncentive
                    }
                  ]"
                >
                  <BalIcon size="sm" name="check" v-if="hasIncentive" />
                  <BalIcon size="sm" name="x" v-else />
                </div>
                <h6>{{ $t('stakingIncentives') }}</h6>
              </BalStack>
              <BalStack
                v-if="hasIncentive"
                horizontal
                spacing="sm"
                align="center"
              >
                <BalIcon name="chevron-down" class="text-blue-500" />
              </BalStack>
            </BalStack>
          </button>
        </template>
        <template v-slot:staking-incentives>
          <div class="bg-white relative">
            <BalStack
              ref="contentWrapper"
              vertical
              spacing="sm"
              class="px-4 py-4 border-t"
            >
              <BalStack horizontal justify="between">
                <span>{{ $t('staking.stakedLPTokens') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between">
                <span>{{ $t('staking.unclaimedIncentives') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between">
                <span>{{ $t('staking.unstakedLPTokens') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between">
                <span>{{ $t('staking.potentialWeeklyYield') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal spacing="sm" class="mt-2">
                <BalBtn color="gradient" size="sm">{{ $t('stake') }}</BalBtn>
                <BalBtn outline color="gradient" size="sm">{{
                  $t('unstake')
                }}</BalBtn>
              </BalStack>
            </BalStack>
          </div>
        </template>
      </BalAccordion>
    </div>
  </AnimatePresence>
  <AnimatePresence :isVisible="isLoading" unmountInstantly>
    <BalLoadingBlock class="h-12" />
  </AnimatePresence>
</template>

<style>
.handle::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  background: linear-gradient(90deg, #4254ff, #f441a5, #ffeb3b, #4254ff);
  background-size: 400%;
  animation: anim 8s linear infinite;

  border-radius: 14px;
  opacity: 1;
  z-index: -1;
}

@keyframes anim {
  from {
    background-position: 0;
  }
  to {
    background-position: 400%;
  }
}
</style>
