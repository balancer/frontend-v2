<script setup lang="ts">
import { computed } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { useLock } from '@/composables/useLock';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

type Props = {
  pool: Pool;
};
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();
const { lockedFiatTotal, lock, isLoadingLockInfo } = useLock();

/**
 * COMPUTED
 */
const poolShares = computed(() =>
  bnum(props.pool.totalLiquidity).div(props.pool.totalShares)
);
const bptBalance = computed(() => balanceFor(props.pool.address));

const fiatTotal = computed(() =>
  poolShares.value.times(bptBalance.value).toString()
);
</script>

<template>
  <div>
    <AnimatePresence :isVisible="!isLoadingLockInfo">
      <div class="relative">
        <BalAccordion
          :class="[
            'shadow-2xl overflow-visible',
            { 'pool-handle': !isLoadingLockInfo },
          ]"
          :sections="[
            {
              title: 'Locking',
              id: 'locking-module',
              handle: 'locking-handle',
              isDisabled: isLoadingLockInfo,
            },
          ]"
        >
          <template v-slot:locking-handle>
            <button
              class="
                p-4
                rounded-xl
                w-full
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition-colors
              "
            >
              <BalStack horizontal justify="between" align="center">
                <BalStack spacing="sm" horizontal>
                  <div
                    class="
                      flex
                      items-center
                      p-1
                      text-white
                      rounded-full
                      bg-green-500
                    "
                  >
                    <BalIcon size="sm" name="check" />
                  </div>
                  <BalStack spacing="sm" align="center">
                    <h6>{{ $t('locking.lockBptForVeBal') }}</h6>
                  </BalStack>
                </BalStack>
                <BalStack horizontal spacing="sm" align="center">
                  <BalIcon name="chevron-down" class="text-blue-500" />
                </BalStack>
              </BalStack>
            </button>
          </template>
          <template v-slot:locking-module>
            <div
              class="
                bg-white
                dark:bg-gray-850
                relative
                overflow-visible
                rounded-b-lg
              "
            >
              <BalStack
                vertical
                spacing="sm"
                class="px-4 py-4 border-t dark:border-gray-900"
              >
                <BalStack horizontal justify="between">
                  <span v-if="!lock?.isExpired"
                    >{{ $t('locked') }} {{ $t('lpTokens') }}</span
                  >
                  <span class="text-red-500" v-else>{{
                    $t('locking.expiredLockLpTokens')
                  }}</span>
                  <BalStack horizontal spacing="sm" align="center">
                    <AnimatePresence :isVisible="false">
                      <BalLoadingBlock class="h-5" />
                    </AnimatePresence>
                    <AnimatePresence :isVisible="true">
                      <span :class="{ 'text-red-500': lock?.isExpired }">
                        {{ fNum2(lockedFiatTotal, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip
                      v-if="!lock?.isExpired"
                      :text="$t('locking.lockedLpTokensTooltip')"
                    />
                    <BalTooltip v-else :text="$t('locking.expiredLockTooltip')">
                      <template v-slot:activator>
                        <BalIcon
                          class="text-red-500"
                          size="sm"
                          name="alert-triangle"
                        />
                      </template>
                    </BalTooltip>
                  </BalStack>
                </BalStack>
                <BalStack horizontal justify="between">
                  <span>{{ $t('unlocked') }} {{ $t('lpTokens') }}</span>
                  <BalStack horizontal spacing="sm" align="center">
                    <AnimatePresence :isVisible="false">
                      <BalLoadingBlock class="h-5" />
                    </AnimatePresence>
                    <AnimatePresence :isVisible="true">
                      <span>
                        {{ fNum2(fiatTotal, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip :text="$t('locking.unlockedLpTokensTooltip')" />
                  </BalStack>
                </BalStack>
                <BalStack horizontal spacing="sm" class="mt-2">
                  <BalLink href="/#/vebal">
                    <BalBtn
                      :disabled="Number(bptBalance) === 0"
                      color="gradient"
                      size="sm"
                    >
                      {{ $t('lock') }}
                    </BalBtn>
                  </BalLink>
                  <BalLink href="/#/vebal">
                    <BalBtn v-if="lock?.isExpired" outline color="red" size="sm">
                      {{ $t('redeem') }}
                    </BalBtn>
                  </BalLink>
                </BalStack>
              </BalStack>
            </div>
          </template>
        </BalAccordion>
      </div>
    </AnimatePresence>
    <AnimatePresence :isVisible="isLoadingLockInfo" unmountInstantly>
      <BalLoadingBlock class="h-12" />
    </AnimatePresence>
  </div>
</template>

<style>
.pool-handle {
  @apply rounded-xl;
}

.pool-handle::before {
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

.pool-handle:hover:before {
  animation: anim 12s linear infinite;
}

.pool-handle .bal-card {
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
