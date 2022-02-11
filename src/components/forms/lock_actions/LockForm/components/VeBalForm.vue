<script setup lang="ts">
import { computed, ref } from 'vue';
import { addDays, format, differenceInDays } from 'date-fns';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import LockPreviewModal from './LockPreviewModal/LockPreviewModal.vue';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBal';

import useTokens from '@/composables/useTokens';

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

const minLockTimestamp = addDays(now, MIN_LOCK_IN_DAYS).getTime();
const maxLockTimestamp = addDays(now, MAX_LOCK_IN_DAYS).getTime();
const defaultLockTimestamp = addDays(now, DEFAULT_LOCK_IN_DAYS).getTime();

const lockedUntil = ref(format(defaultLockTimestamp, INPUT_DATE_FORMAT));

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
const bptBalance = computed(() => balanceFor(props.lockablePool.address));

const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

const isValidLockAmount = computed(() => bnum(lockAmount.value ?? '0').gt(0));

const isValidDate = computed(() => {
  if (lockedUntil.value != null) {
    const lockedUntilTimestamp = new Date(lockedUntil.value).getTime();

    return (
      lockedUntilTimestamp >= minLockTimestamp &&
      lockedUntilTimestamp <= maxLockTimestamp
    );
  }

  return false;
});

const submissionDisabled = computed(
  () => !hasBpt.value || !isValidLockAmount.value || !isValidDate.value
);

const expectedVeBalAmount = computed(() => {
  if (!submissionDisabled.value) {
    const lockAmountBN = bnum(lockAmount.value);

    const lockAmountInDays =
      differenceInDays(new Date(lockedUntil.value), now) + 1;

    return lockAmountBN
      .times(lockAmountInDays)
      .div(MAX_LOCK_IN_DAYS)
      .toString();
  }
  return '0';
});

const lockType = computed(() => {
  if (props.veBalLockInfo.hasLock) {
    return LockType.INCREASE_LOCK;
  }
  return LockType.CREATE_LOCK;
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
        {{ $t('getVeBAL.lockForm.lockedUntil.title') }}
      </div>
      <BalTextInput
        name="lockedUntil"
        type="date"
        v-model="lockedUntil"
        :min="format(minLockTimestamp, INPUT_DATE_FORMAT)"
        :max="format(maxLockTimestamp, INPUT_DATE_FORMAT)"
      />
    </div>
    <div>
      <div class="flex justify-between">
        <div>veBAL you get</div>
        <div>{{ expectedVeBalAmount }}</div>
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
      :lockedUntil="lockedUntil"
      :expectedVeBalAmount="expectedVeBalAmount"
      :lockType="lockType"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
