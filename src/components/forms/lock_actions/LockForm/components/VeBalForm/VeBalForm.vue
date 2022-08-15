<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import { LockType } from '@/components/forms/lock_actions/LockForm/types';
import useTokens from '@/composables/useTokens';
import { expectedVeBal } from '@/composables/useVeBAL';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

import useLockAmount from '../../composables/useLockAmount';
import useLockEndDate from '../../composables/useLockEndDate';
import useLockState from '../../composables/useLockState';
import LockPreviewModal from '../LockPreviewModal/LockPreviewModal.vue';
import LockAmount from './components/LockAmount.vue';
import LockEndDate from './components/LockEndDate.vue';
import Summary from './components/Summary.vue';

/**
 * TYPES
 */
type Props = {
  lockablePool: Pool;
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
const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } =
  useWeb3();

const { isValidLockAmount, isIncreasedLockAmount, totalLpTokens } =
  useLockAmount(toRef(props, 'veBalLockInfo'));

const {
  minLockEndDateTimestamp,
  maxLockEndDateTimestamp,
  isValidLockEndDate,
  isExtendedLockEndDate,
} = useLockEndDate(props.veBalLockInfo);

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

  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
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
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
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
}

function handleShowPreviewModal() {
  if (submissionDisabled.value) return;
  showPreviewModal.value = true;
}
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="pb-1.5 text-xs leading-none text-secondary">
          {{ configService.network.chainName }}
        </div>
        <div class="flex justify-between items-center">
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
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        color="gradient"
        block
        :disabled="submissionDisabled"
        @click="handleShowPreviewModal"
      >
        {{ $t('preview') }}
      </BalBtn>
    </div>
  </BalCard>
  <teleport to="#modal">
    <LockPreviewModal
      v-if="showPreviewModal && veBalLockInfo"
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
