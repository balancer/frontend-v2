<script setup lang="ts">
import { getAddress } from '@ethersproject/address';

import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

import StakePreviewModal from './StakePreviewModal.vue';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

import { deprecatedDetails } from '@/composables/usePoolHelpers';
import { usePoolWarning } from '@/composables/usePoolWarning';
import { StakeAction } from './composables/useStakePreview';
import StakingCardSyncAlert from '../../vebal/cross-chain-boost/StakingCardSyncAlert.vue';
import useNetwork from '@/composables/useNetwork';
import { Network } from '@/lib/config/types';

type Props = {
  pool: Pool;
};
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'setRestakeVisibility', value: boolean): void;
}>();
/**
 * STATE
 */

const isStakePreviewVisible = ref(false);
const stakeAction = ref<StakeAction>('stake');
const poolId = computed(() => props.pool.id);
const isOpenedByDefault = ref(false);
/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { balanceFor } = useTokens();
const {
  isStakablePool,
  isLoading: isLoadingStakingData,
  isRefetchingStakedShares,
  stakedShares,
  hasNonPrefGaugeBalance,
  preferentialGaugeAddress,
} = usePoolStaking();
const { isAffected } = usePoolWarning(poolId);
const { networkId } = useNetwork();

/**
 * COMPUTED
 */
const fiatValueOfStakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times((stakedShares.value || 0).toString())
    .toString();
});

const fiatValueOfUnstakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(balanceFor(getAddress(props.pool.address)))
    .toString();
});

const isStakeDisabled = computed(() => {
  return (
    !!deprecatedDetails(props.pool.id) ||
    fiatValueOfUnstakedShares.value === '0' ||
    hasNonPrefGaugeBalance.value ||
    !preferentialGaugeAddress.value
  );
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
</script>

<template>
  <div>
    <AnimatePresence :isVisible="!isLoadingStakingData">
      <div class="relative">
        <BalAccordion
          :class="['shadow-2xl', { handle: isStakablePool }]"
          :sections="[
            {
              title: $t('staking.stakingIncentives'),
              id: 'staking-incentives',
              handle: 'staking-handle',
              isDisabled: !isStakablePool,
            },
          ]"
          :reCalcKey="hasNonPrefGaugeBalance ? 0 : 1"
          :isOpenedByDefault="isOpenedByDefault"
        >
          <template #staking-handle>
            <button
              class="p-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <BalStack horizontal justify="between" align="center">
                <BalStack spacing="sm" align="center">
                  <div
                    :class="[
                      'flex items-center p-1 text-white rounded-full',
                      {
                        'bg-green-500': isStakablePool,
                        'bg-gray-400': !isStakablePool,
                      },
                    ]"
                  >
                    <BalIcon v-if="isStakablePool" size="sm" name="check" />
                    <BalIcon v-else size="sm" name="x" />
                  </div>
                  <h6>{{ $t('staking.stakingIncentives') }}</h6>
                </BalStack>
                <BalStack
                  v-if="isStakablePool"
                  horizontal
                  spacing="sm"
                  align="center"
                >
                  <BalIcon name="chevron-down" class="text-blue-500" />
                </BalStack>
              </BalStack>
            </button>
          </template>
          <template #staking-incentives>
            <div class="relative bg-white dark:bg-gray-850 rounded-b-lg">
              <BalStack
                vertical
                spacing="sm"
                class="p-4 rounded-b-lg border-t dark:border-gray-900"
              >
                <BalStack horizontal justify="between" class="rounded-b-lg">
                  <span>{{ $t('staked') }} {{ $t('lpTokens') }}</span>
                  <BalStack horizontal spacing="sm" align="center">
                    <AnimatePresence :isVisible="isRefetchingStakedShares">
                      <BalLoadingBlock class="h-5" />
                    </AnimatePresence>
                    <AnimatePresence :isVisible="!isRefetchingStakedShares">
                      <span>
                        {{ fNum(fiatValueOfStakedShares, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip :text="$t('staking.stakedLpTokensTooltip')" />
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
                        {{ fNum(fiatValueOfUnstakedShares, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip :text="$t('staking.unstakedLpTokensTooltip')" />
                  </BalStack>
                </BalStack>
                <StakingCardSyncAlert
                  v-if="networkId !== Network.MAINNET"
                  :poolAddress="pool.address"
                  :poolId="pool.id"
                  :fiatValueOfStakedShares="fiatValueOfStakedShares"
                  :fiatValueOfUnstakedShares="fiatValueOfUnstakedShares"
                  @should-staking-card-be-opened="isOpenedByDefault = true"
                />
                <BalStack
                  v-if="hasNonPrefGaugeBalance && !isAffected"
                  horizontal
                  spacing="sm"
                  class="mt-2"
                >
                  <BalBtn
                    color="gradient"
                    size="sm"
                    @click="emit('setRestakeVisibility', true)"
                  >
                    {{ $t('restake') }}
                  </BalBtn>

                  <BalBtn
                    outline
                    color="blue"
                    size="sm"
                    :disabled="fiatValueOfStakedShares === '0'"
                    @click="showUnstakePreview"
                  >
                    {{ $t('unstake') }}
                  </BalBtn>
                </BalStack>

                <BalStack v-else horizontal spacing="sm" class="mt-2">
                  <BalBtn
                    color="gradient"
                    size="sm"
                    :disabled="isStakeDisabled"
                    @click="showStakePreview"
                  >
                    {{ $t('stake') }}
                  </BalBtn>
                  <BalBtn
                    outline
                    color="blue"
                    size="sm"
                    :disabled="fiatValueOfStakedShares === '0'"
                    @click="showUnstakePreview"
                  >
                    {{ $t('unstake') }}
                  </BalBtn>
                </BalStack>
                <BalAlert
                  v-if="hasNonPrefGaugeBalance && networkId === Network.MAINNET"
                  :title="$t('staking.restakeGauge')"
                  class="mt-2"
                >
                  {{ $t('staking.restakeGaugeDescription') }}
                </BalAlert>
              </BalStack>
            </div>
          </template>
        </BalAccordion>
      </div>
    </AnimatePresence>
    <AnimatePresence :isVisible="isLoadingStakingData" unmountInstantly>
      <BalLoadingBlock class="h-12" />
    </AnimatePresence>
    <StakePreviewModal
      :isVisible="isStakePreviewVisible"
      :pool="pool"
      :action="stakeAction"
      @close="handlePreviewClose"
    />
  </div>
</template>

<style>
.handle {
  @apply overflow-hidden rounded-xl;
}

.handle::before {
  @apply absolute left-0 w-full opacity-100;

  content: '';
  top: -2px;
  height: calc(100% + 4px);
  background: linear-gradient(90deg, #4254ff, #f441a5, #ffeb3b, #4254ff);
  background-size: 400%;
  animation: anim-half 3s ease-out both;
  border-radius: 14px;
  z-index: -1;
}

.handle:hover::before {
  animation: anim 12s linear infinite;
}

.handle .bal-card {
  @apply mx-auto;

  width: calc(100% - 4px);
}

@keyframes anim-half {
  from {
    background-position: 0;
  }

  to {
    background-position: 125%;
  }
}

@keyframes anim {
  from {
    background-position: 125%;
  }

  to {
    background-position: 600%;
  }
}
</style>
