<script setup lang="ts">
import { computed, ref } from 'vue';
import { differenceInDays } from 'date-fns';

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

import { MAX_LOCK_IN_DAYS } from '../../constants';

import { LockType } from '../../types';

type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo: VeBalLockInfo;
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
  isValidLockAmount,
  isIncreasedLockAmount,
  totalLpTokens
} = useLockAmount(props.veBalLockInfo);

const {
  todaysDate,
  minLockEndDateTimestamp,
  maxLockEndDateTimestamp,
  isValidLockEndDate,
  isExtendedLockEndDate
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
  if (props.veBalLockInfo.hasExistingLock) {
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

  const lockEndDateInDays =
    differenceInDays(new Date(lockEndDate.value), todaysDate) + 1;

  return bnum(totalLpTokens.value)
    .times(lockEndDateInDays)
    .div(MAX_LOCK_IN_DAYS)
    .toString();
});

const lockType = computed(() => {
  if (props.veBalLockInfo.hasExistingLock) {
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

    <LockAmount :lockablePoolTokenInfo="lockablePoolTokenInfo" />

    <LockEndDate
      :minLockEndDateTimestamp="minLockEndDateTimestamp"
      :maxLockEndDateTimestamp="maxLockEndDateTimestamp"
    />

    <Summary :expectedVeBalAmount="expectedVeBalAmount" />

    <BalBtn
      color="gradient"
      class="mt-6"
      block
      :disabled="submissionDisabled"
      @click="showPreviewModal = true"
    >
      {{ $t('preview') }}
    </BalBtn>
  </BalCard>
  <teleport to="#modal">
    <LockPreviewModal
      v-if="showPreviewModal"
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :expectedVeBalAmount="expectedVeBalAmount"
      :lockType="lockType"
      :veBalLockInfo="veBalLockInfo"
      :totalLpTokens="totalLpTokens"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
