<script setup lang="ts">
import { computed, ref } from 'vue';
import { addDays, format, differenceInDays } from 'date-fns';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import LockPreviewModal from './LockPreviewModal/LockPreviewModal.vue';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';

import { TokenInfo } from '@/types/TokenList';

import {
  INPUT_DATE_FORMAT,
  DEFAULT_LOCK_IN_DAYS,
  MAX_LOCK_IN_DAYS,
  MIN_LOCK_IN_DAYS
} from '../constants';

import { LockType } from '../types';

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
const lockAmount = ref('');
const now = new Date();

const minLockEndDateTimestamp = props.veBalLockInfo.hasExistingLock
  ? props.veBalLockInfo.lockedEndDate
  : addDays(now, MIN_LOCK_IN_DAYS).getTime();
const maxLockEndDateTimestamp = addDays(now, MAX_LOCK_IN_DAYS).getTime();
const defaultLockTimestamp = addDays(now, DEFAULT_LOCK_IN_DAYS).getTime();

const lockEndDate = ref(
  props.veBalLockInfo.hasExistingLock
    ? format(props.veBalLockInfo.lockedEndDate, INPUT_DATE_FORMAT)
    : format(defaultLockTimestamp, INPUT_DATE_FORMAT)
);

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { fNum2 } = useNumbers();
const { veBalTokenInfo } = useVeBal();

/**
 * COMPUTED
 */
const lockablePoolBptBalance = computed(() =>
  balanceFor(props.lockablePool.address)
);

const lockEndDateTimestamp = computed(() =>
  new Date(lockEndDate.value).getTime()
);

const isValidLockAmount = computed(() => bnum(lockAmount.value ?? '0').gt(0));

const isValidLockEndDate = computed(
  () =>
    lockEndDateTimestamp.value >= minLockEndDateTimestamp &&
    lockEndDateTimestamp.value <= maxLockEndDateTimestamp
);

const isIncreasedLockAmount = computed(
  () => props.veBalLockInfo.hasExistingLock && isValidLockAmount.value
);

const isExtendedLockEndDate = computed(
  () =>
    props.veBalLockInfo.hasExistingLock &&
    lockEndDateTimestamp.value > props.veBalLockInfo.lockedEndDate
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

const totalLpTokens = computed(() => {
  if (!submissionDisabled.value) {
    return props.veBalLockInfo.hasExistingLock
      ? bnum(props.veBalLockInfo.lockedAmount)
          .plus(lockAmount.value || '0')
          .toString()
      : lockAmount.value;
  }
  return '0';
});

const expectedVeBalAmount = computed(() => {
  if (!submissionDisabled.value) {
    const lockEndDateInDays =
      differenceInDays(new Date(lockEndDate.value), now) + 1;

    return bnum(totalLpTokens.value)
      .times(lockEndDateInDays)
      .div(MAX_LOCK_IN_DAYS)
      .toString();
  }
  return '0';
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
    <div class="mb-6">
      <div class="pb-4">
        {{ $t('getVeBAL.lockForm.lockAmount.title') }}
      </div>
      <TokenInput
        :address="lockablePoolTokenInfo.address"
        v-model:amount="lockAmount"
        fixedToken
        name="lockableToken"
      />
    </div>
    <div class="mb-6">
      <div class="pb-4">
        {{ $t('getVeBAL.lockForm.lockEndDate.title') }}
      </div>
      <BalTextInput
        name="lockEndDate"
        type="date"
        v-model="lockEndDate"
        :min="format(minLockEndDateTimestamp, INPUT_DATE_FORMAT)"
        :max="format(maxLockEndDateTimestamp, INPUT_DATE_FORMAT)"
      />
    </div>
    <div>
      <div class="flex justify-between">
        <div>{{ $t('getVeBAL.lockForm.summary.receive.title') }}</div>
        <div>
          {{
            expectedVeBalAmount != null
              ? fNum2(expectedVeBalAmount, FNumFormats.token)
              : '-'
          }}
          {{ veBalTokenInfo.symbol }}
        </div>
      </div>
    </div>
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
