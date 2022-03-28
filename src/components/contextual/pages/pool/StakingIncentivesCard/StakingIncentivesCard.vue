<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { computed, ref } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useStaking from '@/composables/staking/useStaking';
import { FullPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import useTokens from '@/composables/useTokens';
import { getAddress } from 'ethers/lib/utils';
import StakePreviewModal from '../../../stake/StakePreviewModal.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

type Props = {
  pool: FullPool;
};
const props = defineProps<Props>();

/**
 * STATE
 */

const isStakePreviewVisible = ref(false);
const stakeAction = ref('');

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();
const {
  refetchStakedShares,
  isStakedSharesIdle,
  isLoadingStakedShares,
  isRefetchingStakedShares,
  isLoadingPoolEligibility,
  isPoolEligibleForStaking,
  hideAprInfo,
  stakedSharesForProvidedPool
} = useStaking();

/**
 * COMPUTED
 */
const fiatValueOfStakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times((stakedSharesForProvidedPool.value || 0).toString())
    .toString();
});

const fiatValueOfUnstakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(balanceFor(getAddress(props.pool.address)))
    .toString();
});

/**
 * METHODS
 */
function showStakePreview() {
  if (fiatValueOfUnstakedShares.value === '0') return;
  stakeAction.value = 'stake';
  isStakePreviewVisible.value = true;
}

function showUnstakePreview() {
  if (fiatValueOfStakedShares.value === '0') return;
  stakeAction.value = 'unstake';
  isStakePreviewVisible.value = true;
}

function handlePreviewClose() {
  isStakePreviewVisible.value = false;
}

async function handleActionSuccess() {
  await refetchStakedShares.value();
}
</script>

<template>
  <AnimatePresence
    :isVisible="
      !isLoadingStakedShares && !isStakedSharesIdle && !isLoadingPoolEligibility
    "
  >
    <div class="relative">
      <BalAccordion
        :class="['shadow-2xl', { handle: isPoolEligibleForStaking }]"
        :sections="[
          {
            title: $t('stakingIncentives'),
            id: 'staking-incentives',
            handle: 'staking-handle',
            isDisabled: !isPoolEligibleForStaking
          }
        ]"
      >
        <template v-slot:staking-handle>
          <button
            class="p-4 rounded-xl w-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <BalStack horizontal justify="between" align="center">
              <BalStack spacing="sm" align="center">
                <div
                  :class="[
                    'flex items-center p-1 text-white rounded-full',
                    {
                      'bg-green-500': isPoolEligibleForStaking,
                      'bg-gray-400': !isPoolEligibleForStaking
                    }
                  ]"
                >
                  <BalIcon
                    size="sm"
                    name="check"
                    v-if="isPoolEligibleForStaking"
                  />
                  <BalIcon size="sm" name="x" v-else />
                </div>
                <h6>{{ $t('staking.stakingIncentives') }}</h6>
              </BalStack>
              <BalStack
                v-if="isPoolEligibleForStaking"
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
          <div class="bg-white dark:bg-gray-850 relative">
            <BalStack
              vertical
              spacing="sm"
              class="px-4 py-4 border-t dark:border-gray-900"
            >
              <BalStack horizontal justify="between">
                <span>{{ $t('staked') }} {{ $t('lpTokens') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <AnimatePresence :isVisible="isRefetchingStakedShares">
                    <BalLoadingBlock class="h-5" />
                  </AnimatePresence>
                  <AnimatePresence :isVisible="!isRefetchingStakedShares">
                    <span>
                      {{ fNum2(fiatValueOfStakedShares, FNumFormats.fiat) }}
                    </span>
                  </AnimatePresence>
                  <BalTooltip :text="$t('staking.stakedLpTokensTooltip')" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between" v-if="!hideAprInfo">
                <span>{{ $t('staking.unclaimedIncentives') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between">
                <span>{{ $t('unstaked') }} {{ $t('lpTokens') }}</span>
                <BalStack horizontal spacing="sm" align="center">
                  <AnimatePresence :isVisible="isRefetchingStakedShares">
                    <BalLoadingBlock class="h-5" />
                  </AnimatePresence>
                  <AnimatePresence :isVisible="!isRefetchingStakedShares">
                    <span>
                      {{ fNum2(fiatValueOfUnstakedShares, FNumFormats.fiat) }}
                    </span>
                  </AnimatePresence>
                  <BalTooltip :text="$t('staking.unstakedLpTokensTooltip')" />
                </BalStack>
              </BalStack>
              <BalStack horizontal justify="between" v-if="!hideAprInfo">
                <span>
                  {{ $t('potential') }} {{ $t('staking.weeklyEarning') }}
                </span>
                <BalStack horizontal spacing="sm" align="center">
                  <span>{{ fNum2(1, FNumFormats.fiat) }}</span>
                  <BalTooltip text="Bingo" />
                </BalStack>
              </BalStack>
              <BalStack horizontal spacing="sm" class="mt-2">
                <BalBtn
                  color="gradient"
                  size="sm"
                  @click="showStakePreview"
                  :disabled="fiatValueOfUnstakedShares === '0'"
                >
                  {{ $t('stake') }}
                </BalBtn>
                <BalBtn
                  outline
                  color="gray"
                  size="sm"
                  @click="showUnstakePreview"
                  :disabled="fiatValueOfStakedShares === '0'"
                >
                  {{ $t('unstake') }}
                </BalBtn>
              </BalStack>
            </BalStack>
          </div>
        </template>
      </BalAccordion>
    </div>
  </AnimatePresence>
  <AnimatePresence
    :isVisible="
      isLoadingStakedShares || isStakedSharesIdle || isLoadingPoolEligibility
    "
    unmountInstantly
  >
    <BalLoadingBlock class="h-12" />
  </AnimatePresence>
  <StakePreviewModal
    :isVisible="isStakePreviewVisible"
    :pool="pool"
    :action="stakeAction"
    @close="handlePreviewClose"
    @success="handleActionSuccess"
  />
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
