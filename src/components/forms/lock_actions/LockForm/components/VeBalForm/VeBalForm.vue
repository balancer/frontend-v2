<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

import LockPreviewModal from '../LockPreviewModal/LockPreviewModal.vue';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useTokens from '@/composables/useTokens';

import { TokenInfo } from '@/types/TokenList';

import Summary from './components/Summary.vue';
import LockAmount from './components/LockAmount.vue';
import LockEndDate from './components/LockEndDate.vue';

import useLockState from '../../composables/useLockState';
import useLockAmount from '../../composables/useLockAmount';
import useLockEndDate from '../../composables/useLockEndDate';

import { LockType } from '@/components/forms/lock_actions/LockForm/types';

import useWeb3 from '@/services/web3/useWeb3';
import { expectedVeBal } from '@/composables/useVeBAL';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

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
const showPreviewModal = ref(false);

const { lockEndDate, lockAmount } = useLockState();
const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

const {
  isValidLockAmount,
  isIncreasedLockAmount,
  totalLpTokens
} = useLockAmount(toRef(props, 'veBalLockInfo'));

const {
  minLockEndDateTimestamp,
  maxLockEndDateTimestamp,
  isValidLockEndDate,
  isExtendedLockEndDate
} = useLockEndDate(props.veBalLockInfo);
const { refetch: refetchLockInfo } = useVeBalLockInfoQuery();

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
const lockablePoolBptBalance = computed(() =>
  balanceFor(props.lockablePool.address)
);

const submissionDisabled = computed(() => {
  if (isMismatchedNetwork.value) {
    return true;
  }

  if (props.veBalLockInfo?.hasExistingLock) {
    return !isIncreasedLockAmount.value && !isExtendedLockEndDate.value;
  }

  return (
    !bnum(lockablePoolBptBalance.value).gt(0) ||
    !isValidLockAmount.value ||
    !isValidLockEndDate.value
  );
});

const expectedVeBalAmount = computed(() => {
  if (submissionDisabled.value) {
    return '0';
  }

  return expectedVeBal(totalLpTokens.value, lockEndDate.value);
});

const lockType = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock) {
    if (isIncreasedLockAmount.value && isExtendedLockEndDate.value) {
      return [LockType.INCREASE_LOCK, LockType.EXTEND_LOCK];
    }
    if (isExtendedLockEndDate.value) {
      return [LockType.EXTEND_LOCK];
    }
    if (isIncreasedLockAmount.value) {
      return [LockType.INCREASE_LOCK];
    }
  }
  return [LockType.CREATE_LOCK];
});

/**
 * METHODS
 */
function handleClosePreviewModal() {
  showPreviewModal.value = false;
  refetchLockInfo.value();
}
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs text-gray-500 leading-none">
          {{ configService.network.chainName }}
        </div>
        <div class="flex items-center justify-between">
          <h4>
            {{ $t('getVeBAL.lockForm.title') }}
          </h4>
        </div>
      </div>
    </template>

    <LockAmount
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
    />

    <LockEndDate
      :minLockEndDateTimestamp="minLockEndDateTimestamp"
      :maxLockEndDateTimestamp="maxLockEndDateTimestamp"
      :veBalLockInfo="veBalLockInfo"
    />

    <Summary :expectedVeBalAmount="expectedVeBalAmount" />

    <div class="mt-6">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="toggleWalletSelectModal"
      />
      <BalBtn
        v-else
        color="gradient"
        block
        :disabled="submissionDisabled"
        @click="showPreviewModal = true"
      >
        {{ $t('preview') }}
      </BalBtn>
    </div>
  </BalCard>
  <teleport to="#modal">
    <LockPreviewModal
      v-if="showPreviewModal"
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :lockType="lockType"
      :veBalLockInfo="veBalLockInfo"
      :totalLpTokens="totalLpTokens"
      @close="handleClosePreviewModal"
    />
  </teleport>
</template>
