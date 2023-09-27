<script setup lang="ts">
import { computed, ref } from 'vue';
import lock from '@/assets/images/icons/lock.svg';
import unlock from '@/assets/images/icons/unlock.svg';

import UnlockPreviewModal from '@/components/forms/lock_actions/UnlockForm/components/UnlockPreviewModal/UnlockPreviewModal.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useVeBal from '@/composables/useVeBAL';
import useNetwork from '@/composables/useNetwork';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: Pool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo?: VeBalLockInfo | null;
  totalLockedValue: string;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  veBalLockInfo: null,
});

/**
 * STATE
 */
const showUnlockPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { fNum } = useNumbers();
const { lockablePoolId } = useVeBal();
const { isWalletReady } = useWeb3();
const { networkSlug } = useNetwork();

/**
 * COMPUTED
 */
const poolShares = computed(() =>
  bnum(props.lockablePool.totalLiquidity).div(props.lockablePool.totalShares)
);

const bptBalance = computed(() => balanceFor(props.lockablePool.address));

const fiatTotal = computed(() =>
  poolShares.value.times(bptBalance.value).toString()
);

const totalExpiredLpTokens = computed(() =>
  props.veBalLockInfo?.isExpired ? props.veBalLockInfo.lockedAmount : '0'
);

const fiatTotalExpiredLpTokens = computed(() =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(totalExpiredLpTokens.value)
    .toString()
);

const cards = computed(() => {
  return [
    {
      id: 'unlockedVeBAL',
      label: 'Unlocked ve8020 BAL/WETH',
      icon: unlock,
      iconBgColor: 'bg-yellow-100',
      value: fNum(bptBalance.value, FNumFormats.token),
      secondaryText: fNum(fiatTotal.value, FNumFormats.fiat),
    },
    {
      id: 'lockedVeBAL',
      label: 'Locked ve8020 BAL/WETH',
      icon: lock,
      iconBgColor: 'bg-green-50',
      value: fNum(props.veBalLockInfo?.lockedAmount ?? '0', FNumFormats.token),
      secondaryText: fNum(props.totalLockedValue, FNumFormats.fiat),
      showUnlockIcon: Boolean(props.veBalLockInfo?.isExpired),
    },
  ];
});
</script>

<template>
  <BalCard v-for="card in cards" :key="card.id">
    <div class="flex justify-between items-center">
      <div class="font-bold label">
        {{ card.label }}
      </div>
      <div
        :class="[
          card.iconBgColor,
          'flex items-center p-3 rounded-full justifty center bg-red',
        ]"
      >
        <img :src="card.icon" alt="card.label" />
      </div>
    </div>
    <div class="value" :class="card.id">
      <div v-if="card.id === 'lockedVeBAL'">
        <span
          :class="{ 'text-red-500': bnum(totalExpiredLpTokens).gt(0) }"
          class="mr-1 font-semibold truncate"
          >{{ card.value }}</span
        >
        <BalTooltip
          v-if="bnum(totalExpiredLpTokens).gt(0)"
          :text="$t('veBAL.myVeBAL.cards.myExpiredLockTooltip')"
          iconSize="sm"
          iconName="alert-triangle"
          :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
          width="72"
          class="relative top-0.5"
        />
      </div>
      <div v-else>
        <span class="text-xl font-bold truncate">{{ card.value }}</span>
      </div>
    </div>
    <div class="mb-3 secondary-value text-secondary">
      {{ card.secondaryText }}
    </div>

    <div class="flex">
      <template v-if="card.id === 'unlockedVeBAL'">
        <BalBtn
          color="blue"
          outline
          class="mr-3"
          @click="
            $router.push({
              name: 'add-liquidity',
              params: { id: lockablePoolId, networkSlug },
              query: { returnRoute: 'vebal' },
            })
          "
        >
          {{ $t('addLiquidity') }}
        </BalBtn>
        <BalBtn
          color="blue"
          outline
          :disabled="Number(bptBalance) === 0"
          @click="
            $router.push({ name: 'get-vebal', query: { returnRoute: 'vebal' } })
          "
        >
          Lock for veBAL
        </BalBtn>
      </template>

      <template v-if="card.id === 'lockedVeBAL'">
        <BalBtn
          v-if="bnum(totalExpiredLpTokens).gt(0)"
          :disabled="!isWalletReady"
          color="blue"
          outline
          @click="showUnlockPreviewModal = true"
        >
          Unlock
        </BalBtn>
        <BalBtn
          v-else
          :disabled="!isWalletReady"
          color="blue"
          outline
          class="mr-3"
          @click="
            $router.push({ name: 'get-vebal', query: { returnRoute: 'vebal' } })
          "
        >
          Extend lock
        </BalBtn>
      </template>
    </div>
  </BalCard>
  <teleport to="#modal">
    <UnlockPreviewModal
      v-if="showUnlockPreviewModal && veBalLockInfo"
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
      :totalLpTokens="totalExpiredLpTokens"
      :fiatTotalLpTokens="fiatTotalExpiredLpTokens"
      @close="showUnlockPreviewModal = false"
    />
  </teleport>
</template>

<style scoped>
.label {
  @apply text-sm mb-2;
}

.value {
  @apply text-xl font-medium flex flex-wrap items-center justify-between mb-0.5;
}

.secondary-value {
  @apply text-sm;
}

.plus-circle:hover,
.plus-circle:focus,
.plus-circle:hover :deep(svg.feather-plus-circle),
.plus-circle:focus :deep(svg.feather-plus-circle) {
  @apply transition-all text-white;

  fill: theme('colors.blue.600');
}

.plus-circle:hover :deep(svg.feather-plus-circle circle),
.plus-circle:focus :deep(svg.feather-plus-circle circle) {
  fill: theme('colors.blue.600');
}

.minus-circle,
.minus-circle:hover :deep(svg.feather-minus-circle circle) {
  fill: theme('colors.red.500');
}

.minus-circle:hover,
.minus-circle:focus {
  transform: scale(1.25);
}

.minus-circle:hover :deep(svg.feather-minus-circle),
.minus-circle:focus :deep(svg.feather-minus-circle) {
  @apply transition-all text-white;

  fill: theme('colors.red.500');
}
</style>
