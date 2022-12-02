<script setup lang="ts">
import { computed, ref } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { useLock } from '@/composables/useLock';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import UnlockPreviewModal from '@/components/forms/lock_actions/UnlockForm/components/UnlockPreviewModal/UnlockPreviewModal.vue';

type Props = {
  pool: Pool;
};
const props = defineProps<Props>();

const showUnlockPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();
const { lockedFiatTotal, lock, isLoadingLockInfo, lockPool, lockPoolToken } =
  useLock();
const { isWalletReady } = useWeb3();

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

const totalExpiredLpTokens = computed(() =>
  lock.value?.isExpired ? lock.value.lockedAmount : '0'
);

const fiatTotalExpiredLpTokens = computed(() =>
  bnum(lockPool.value?.totalLiquidity || '0')
    .div(lockPool.value?.totalShares || '0')
    .times(totalExpiredLpTokens.value)
    .toString()
);
</script>

<template>
  <div v-if="isWalletReady">
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
          <template #locking-handle>
            <button
              class="p-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <BalStack horizontal justify="between" align="center">
                <BalStack spacing="sm" horizontal>
                  <div
                    class="flex items-center p-1 text-white bg-green-500 rounded-full"
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
          <template #locking-module>
            <div
              class="overflow-visible relative bg-white dark:bg-gray-850 rounded-b-lg"
            >
              <BalStack
                vertical
                spacing="sm"
                class="py-4 px-4 border-t dark:border-gray-900"
              >
                <BalStack horizontal justify="between">
                  <span v-if="!lock?.isExpired"
                    >{{ $t('locked') }} {{ $t('lpTokens') }}</span
                  >
                  <span v-else class="text-red-500">{{
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
                      <template #activator>
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
                  <BalLink
                    v-if="Number(bptBalance) > 0"
                    href="/#/get-vebal?returnRoute=vebal"
                  >
                    <BalBtn
                      :disabled="Number(bptBalance) === 0"
                      color="gradient"
                      size="sm"
                    >
                      {{ $t('lock') }}
                    </BalBtn>
                  </BalLink>
                  <BalBtn
                    v-else
                    :disabled="Number(bptBalance) === 0"
                    color="gradient"
                    size="sm"
                  >
                    {{ $t('lock') }}
                  </BalBtn>
                  <BalBtn
                    v-if="lock?.isExpired"
                    outline
                    color="red"
                    size="sm"
                    @click="showUnlockPreviewModal = true"
                  >
                    {{ $t('redeem') }}
                  </BalBtn>
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
    <teleport to="#modal">
      <UnlockPreviewModal
        v-if="showUnlockPreviewModal && lock && lockPool && lockPoolToken"
        :lockablePool="lockPool"
        :lockablePoolTokenInfo="lockPoolToken"
        :veBalLockInfo="lock"
        :totalLpTokens="totalExpiredLpTokens"
        :fiatTotalLpTokens="fiatTotalExpiredLpTokens"
        @close="showUnlockPreviewModal = false"
      />
    </teleport>
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

.pool-handle:hover::before {
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
