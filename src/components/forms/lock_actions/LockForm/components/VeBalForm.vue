<script setup lang="ts">
import { computed, ref } from 'vue';
import { addDays, addYears, format } from 'date-fns';

import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';

import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

import { VeBalLockInfo } from '@/composables/queries/useVeBalLockInfoQuery';
import useTokens from '@/composables/useTokens';

import { Token } from '@/types';

import { bnum } from '@/lib/utils';

type Props = {
  lockablePool: FullPool;
  lockableTokenInfo: Token;
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
const DATE_FORMAT = 'yyyy-MM-dd';

const minLock = format(addDays(now, 1), DATE_FORMAT);
const maxLock = format(addYears(now, 4), DATE_FORMAT);
const defaultLock = format(addYears(now, 1), DATE_FORMAT);

const lockedUntil = ref(defaultLock);

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

const isValidDate = computed(() => lockedUntil.value != null);

const submissionDisabled = computed(
  () => !hasBpt.value || !isValidLockAmount.value || !isValidDate.value
);
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
          <TradeSettingsPopover :context="TradeSettingsContext.invest" />
        </div>
      </div>
    </template>
    <div class="mb-6">
      <div class="pb-4">
        {{ $t('getVeBAL.lockForm.lockAmount.title') }}
      </div>
      <TokenInput
        :address="lockableTokenInfo.address"
        v-model:amount="lockAmount"
        fixedToken
        name="lockableToken"
      />
    </div>
    <div class="mb-6">
      <div class="pb-4">
        {{ $t('getVeBAL.lockForm.lockUntil.title') }}
      </div>
      <BalTextInput
        name="lockedUntil"
        type="date"
        v-model="lockedUntil"
        :min="minLock"
        :max="maxLock"
      />
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
</template>
