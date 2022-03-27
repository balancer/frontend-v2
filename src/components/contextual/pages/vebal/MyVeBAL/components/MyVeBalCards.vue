<script setup lang="ts">
import { computed, ref } from 'vue';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import UnlockPreviewModal from '@/components/forms/lock_actions/UnlockForm/components/UnlockPreviewModal/UnlockPreviewModal.vue';
import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useWeb3 from '@/services/web3/useWeb3';

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
      label: t('veBAL.myVeBAL.cards.myLpToken', [
        props.lockablePoolTokenInfo?.symbol
      ]),
      value: isWalletReady.value
        ? fNum2(fiatTotal.value, FNumFormats.fiat)
        : '—',
      showPlusIcon: isWalletReady.value ? true : false,
      plusIconTo: {
        name: 'invest',
        params: { id: lockablePoolId.value }
      }
    },
    {
      id: 'myLockedLpToken',
      label: t('veBAL.myVeBAL.cards.myLockedLpToken', [
        props.lockablePoolTokenInfo?.symbol
      ]),
      value: hasExistingLock
        ? fNum2(lockedFiatTotal.value, FNumFormats.fiat)
        : '—',
      showPlusIcon: isWalletReady.value ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } },
      showUnlockIcon: isExpired ? true : false
    },
    {
      id: 'lockedEndDate',
      label: t('veBAL.myVeBAL.cards.lockedEndDate'),
      value: lockedUntil.value,
      showPlusIcon: hasExistingLock ? true : false,
      plusIconTo: { name: 'get-vebal', query: { returnRoute: 'vebal' } }
    },
    {
      id: 'myVeBAL',
      label: t('veBAL.myVeBAL.cards.myVeBAL'),
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
  @apply text-xl font-medium truncate flex items-center justify-between;
}
</style>
