<script setup lang="ts">
import { differenceInDays, format } from 'date-fns';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import UnlockPreviewModal from '@/components/forms/lock_actions/UnlockForm/components/UnlockPreviewModal/UnlockPreviewModal.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
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
  lockedFiatTotal: string;
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
const { fNum2 } = useNumbers();
const { veBalBalance, lockablePoolId } = useVeBal();
const { t } = useI18n();
const { isWalletReady } = useWeb3();

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

const lockedUntil = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    return format(props.veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT);
  }

  return '—';
});

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
  const hasExistingLock = props.veBalLockInfo?.hasExistingLock;
  const isExpired = props.veBalLockInfo?.isExpired;

  return [
    {
      id: 'myLpToken',
      label: t('veBAL.myVeBAL.cards.myLpToken.label'),
      value: isWalletReady.value
        ? fNum2(fiatTotal.value, FNumFormats.fiat)
        : '—',
      secondaryText: isWalletReady.value
        ? fNum2(bptBalance.value, FNumFormats.token)
        : '—',
      showPlusIcon: isWalletReady.value ? true : false,
      plusIconTo: {
        name: 'invest',
        params: { id: lockablePoolId.value },
        query: { returnRoute: 'vebal' },
      },
    },
    {
      id: 'myLockedLpToken',
      label: t('veBAL.myVeBAL.cards.myLockedLpToken.label'),
      value: isWalletReady.value
        ? fNum2(props.lockedFiatTotal, FNumFormats.fiat)
        : '—',
      secondaryText: isWalletReady.value
        ? fNum2(props.veBalLockInfo?.lockedAmount ?? '0', FNumFormats.token)
        : '—',
      showPlusIcon: isWalletReady.value && !isExpired ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } },
      showUnlockIcon: isExpired ? true : false,
    },
    {
      id: 'lockedEndDate',
      label: t('veBAL.myVeBAL.cards.lockedEndDate.label'),
      value: lockedUntil.value,
      secondaryText:
        hasExistingLock && !isExpired
          ? t('veBAL.myVeBAL.cards.lockedEndDate.secondaryText', [
              differenceInDays(new Date(lockedUntil.value), new Date()),
            ])
          : '-',
      showPlusIcon: hasExistingLock && !isExpired ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } },
    },
    {
      id: 'myVeBAL',
      label: t('veBAL.myVeBAL.cards.myVeBAL.label'),
      secondaryText:
        props.veBalLockInfo && hasExistingLock && !isExpired
          ? t('veBAL.myVeBAL.cards.myVeBAL.secondaryText', [
              fNum2(
                bnum(veBalBalance.value)
                  .div(props.veBalLockInfo.totalSupply)
                  .toString(),
                {
                  style: 'percent',
                  maximumFractionDigits: 4,
                }
              ),
            ])
          : '-',
      showPlusIcon: false,
      value: hasExistingLock
        ? fNum2(veBalBalance.value, FNumFormats.token)
        : '—',
    },
  ];
});
</script>

<template>
  <BalCard v-for="card in cards" :key="card.id">
    <div class="font-medium label">
      {{ card.label }}
    </div>
    <div class="value" :class="card.id">
      <div v-if="card.id === 'myLockedLpToken'">
        <span
          :class="{ 'text-red-500': bnum(totalExpiredLpTokens).gt(0) }"
          class="mr-1 font-semibold truncate"
          >{{ card.value }}</span
        >
        <BalTooltip
          v-if="bnum(totalExpiredLpTokens).gt(0)"
          :text="$t('veBAL.myVeBAL.cards.myExpiredLockTooltip')"
          iconSize="sm"
          :iconName="'alert-triangle'"
          :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
          width="72"
          class="relative top-0.5"
        />
      </div>
      <div v-else>
        <span class="font-semibold truncate">{{ card.value }}</span>
      </div>
      <div class="flex items-center">
        <BalIcon
          v-if="card.showUnlockIcon"
          name="minus-circle"
          class="mr-2 transition-all cursor-pointer minus-circle"
          @click="showUnlockPreviewModal = true"
        />
        <div>
          <router-link
            v-if="card.showPlusIcon"
            :to="card.plusIconTo"
            class="flex items-center text-blue-600 dark:text-blue-400"
          >
            <BalIcon
              name="plus-circle"
              class="transition-all cursor-pointer plus-circle"
            />
          </router-link>
        </div>
      </div>
    </div>
    <div class="font-medium secondary-value text-secondary">
      {{ card.secondaryText }}
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
