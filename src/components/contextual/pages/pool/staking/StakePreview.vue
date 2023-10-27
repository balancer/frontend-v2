<script setup lang="ts">
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useNumbers from '@/composables/useNumbers';
import { fiatValueOf, tokensListExclBpt } from '@/composables/usePoolHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { AnyPool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import StakeSummary from './StakeSummary.vue';
import { StakeAction, useStakePreview } from './composables/useStakePreview';
import FeedbackCard from '@/components/cards/FeedbackCard.vue';

/**
 * TYPES
 */
type Props = {
  pool: AnyPool;
  action: StakeAction;
};
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum } = useNumbers();
const { isMismatchedNetwork } = useWeb3();
const {
  isActionConfirmed,
  isActionConfirming,
  confirmationReceipt,
  isLoading,
  currentShares,
  stakeActions,
  totalUserPoolSharePct,
  handleSuccess,
  handleClose,
  isStakeAndZero,
} = useStakePreview(props, emit);

/**
 * COMPUTED
 */
const assetRowWidth = computed(
  () => (tokensListExclBpt(props.pool).length * 32) / 1.5
);
</script>

<template>
  <BalVStack spacing="md">
    <BalStack horizontal spacing="sm" align="center">
      <BalCircle
        v-if="isActionConfirmed"
        size="8"
        color="green"
        class="text-white"
      >
        <BalIcon name="check" />
      </BalCircle>
      <h4>{{ $t(`${action}`) }} {{ $t('lpTokens') }}</h4>
    </BalStack>
    <div
      class="py-2 px-4 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700"
    >
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum(currentShares) }} {{ $t('lpTokens') }}</h5>
          <span class="text-secondary">
            {{ getToken(pool.address)?.symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="tokensListExclBpt(pool)"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </div>
    <StakeSummary
      :action="action"
      :fiatValue="fiatValueOf(pool, currentShares)"
      :sharePercentage="totalUserPoolSharePct"
    />
    <BalActionSteps
      v-if="!isActionConfirmed"
      :actions="stakeActions"
      :primaryActionType="action"
      :isLoading="isLoading"
      :disabled="isStakeAndZero || isMismatchedNetwork"
      @success="handleSuccess"
    />
    <BalStack v-if="isActionConfirmed && confirmationReceipt" vertical>
      <ConfirmationIndicator :txReceipt="confirmationReceipt" />
      <AnimatePresence :isVisible="isActionConfirmed">
        <BalBtn
          v-if="action === 'stake'"
          color="gradient"
          block
          @click="$router.push({ name: 'claim' })"
        >
          {{ $t('viewClaims') }}
        </BalBtn>
        <BalBtn v-else color="gray" outline block @click="handleClose">
          {{ $t('close') }}
        </BalBtn>
      </AnimatePresence>
    </BalStack>
    <transition name="pop">
      <FeedbackCard v-if="isActionConfirming || isActionConfirmed" />
    </transition>
  </BalVStack>
</template>
