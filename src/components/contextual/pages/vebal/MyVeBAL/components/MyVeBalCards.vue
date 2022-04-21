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
import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

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

const lockedFiatTotal = computed(() =>
  props.veBalLockInfo?.hasExistingLock
    ? poolShares.value.times(props.veBalLockInfo.lockedAmount).toString()
    : '0'
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
);

const cards = computed(() => {
  const hasExistingLock = props.veBalLockInfo?.hasExistingLock;
  const isExpired = props.veBalLockInfo?.isExpired;

  return [
    {
      id: 'myLpToken',
      label: t('veBAL.myVeBAL.cards.myLpToken.label', [
        props.lockablePoolTokenInfo?.symbol
      ]),
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
        query: { returnRoute: 'vebal' }
      }
    },
    {
      id: 'myLockedLpToken',
      label: t('veBAL.myVeBAL.cards.myLockedLpToken.label', [
        props.lockablePoolTokenInfo?.symbol
      ]),
      value: isWalletReady.value
        ? fNum2(lockedFiatTotal.value, FNumFormats.fiat)
        : '—',
      secondaryText: isWalletReady.value
        ? fNum2(props.veBalLockInfo?.lockedAmount ?? '0', FNumFormats.token)
        : '—',
      showPlusIcon: isWalletReady.value ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } },
      showUnlockIcon: isExpired ? true : false
    },
    {
      id: 'lockedEndDate',
      label: t('veBAL.myVeBAL.cards.lockedEndDate.label'),
      value: lockedUntil.value,
      secondaryText:
        hasExistingLock && !isExpired
          ? t('veBAL.myVeBAL.cards.lockedEndDate.secondaryText', [
              differenceInDays(new Date(lockedUntil.value), new Date())
            ])
          : '-',
      showPlusIcon: hasExistingLock ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } }
    },
    {
      id: 'myVeBAL',
      label: t('veBAL.myVeBAL.cards.myVeBAL.label'),
      secondaryText:
        hasExistingLock && !isExpired
          ? t('veBAL.myVeBAL.cards.myVeBAL.secondaryText', [
              fNum2(
                bnum(veBalBalance.value)
                  .div(props.veBalLockInfo.totalSupply)
                  .toString(),
                {
                  style: 'percent',
                  maximumFractionDigits: 4
                }
              )
            ])
          : '-',
      showPlusIcon: false,
      value: hasExistingLock
        ? fNum2(veBalBalance.value, FNumFormats.token)
        : '—'
    }
  ];
});
</script>

<template>
  <BalCard v-for="card in cards" :key="card.id">
    <div class="label">
      {{ card.label }}
    </div>
    <div class="value">
      <span>{{ card.value }}</span>
      <span>
        <BalIcon
          v-if="card.showUnlockIcon"
          name="minus-circle"
          class="pr-2 cursor-pointer"
          @click="showUnlockPreviewModal = true"
        />
        <router-link
          v-if="card.showPlusIcon"
          :to="card.plusIconTo"
          class="text-blue-500"
        >
          <BalIcon name="plus-circle" class="cursor-pointer" />
        </router-link>
      </span>
    </div>
    <div class="secondary-value">{{ card.secondaryText }}</div>
  </BalCard>
  <teleport to="#modal">
    <UnlockPreviewModal
      v-if="showUnlockPreviewModal"
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
  @apply text-sm text-gray-500 font-medium mb-2;
}
.value {
  @apply text-xl font-medium truncate flex items-center justify-between mb-1;
}

.secondary-value {
  @apply text-gray-400 dark:text-gray-500;
}
</style>
