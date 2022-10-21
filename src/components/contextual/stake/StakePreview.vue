<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { getAddress } from 'ethers/lib/utils';
import { computed, onBeforeMount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQueryClient } from 'vue-query';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useStaking from '@/composables/staking/useStaking';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { getGaugeAddress } from '@/providers/local/staking/staking.provider';
import { AnyPool } from '@/services/pool/types';
import { TransactionActionInfo } from '@/types/transactions';
import useTransactions from '@/composables/useTransactions';
import { usePool } from '@/composables/usePool';

export type StakeAction = 'stake' | 'unstake' | 'restake';
type Props = {
  pool: AnyPool;
  action: StakeAction;
};
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { balanceFor, getToken } = useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const queryClient = useQueryClient();
const { addTransaction } = useTransactions();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));

const {
  userData: {
    stakedSharesForProvidedPool,
    refetchStakedShares,
    refetchUserStakingData,
    refetchHasNonPrefGauge,
  },
  stakeBPT,
  unstakeBPT,
} = useStaking();
const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  [props.pool.address],
  ref([balanceFor(props.pool.address).toString()])
);

const stakeAction = {
  label: t('stake'),
  loadingLabel: t('staking.staking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(stakeBPT),
  stepTooltip: t('staking.stakeTooltip'),
};

const unstakeAction = {
  label: t('unstake'),
  loadingLabel: t('staking.unstaking'),
  confirmingLabel: t('confirming'),
  action: () => txWithNotification(unstakeBPT),
  stepTooltip:
    props.action === 'restake'
      ? t('staking.restakeTooltip')
      : t('staking.unstakeTooltip'),
};

/**
 * STATE
 */
const isLoadingApprovalsForGauge = ref(false);
const isActionConfirmed = ref(false);
const confirmationReceipt = ref<TransactionReceipt>();
const stakeActions = ref<TransactionActionInfo[]>([]);
const shareBalanceToDisplay = ref(
  props.action === 'unstake'
    ? stakedSharesForProvidedPool.value
    : balanceFor(props.pool.address)
);

/**
 * WATCHERS
 */
watch(
  () => props.action,
  () => {
    if (props.action === 'stake') stakeActions.value = [stakeAction];
    if (props.action === 'unstake') stakeActions.value = [unstakeAction];
    if (props.action === 'restake')
      stakeActions.value = [unstakeAction, stakeAction];
  },
  { immediate: true }
);

/* COMPUTED */
const assetRowWidth = computed(() => (props.pool.tokensList.length * 32) / 1.5);

const numSharesToModify = ref(
  props.action === 'stake'
    ? balanceFor(getAddress(props.pool.address))
    : stakedSharesForProvidedPool.value
);

const fiatValueOfModifiedShares = ref(
  bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(numSharesToModify.value)
    .toString()
);

const totalUserPoolSharePct = ref(
  bnum(
    bnum(stakedSharesForProvidedPool.value).plus(
      balanceFor(getAddress(props.pool.address))
    )
  )
    .div(props.pool.totalShares)
    .toString()
);

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  await loadApprovalsForGauge();
});

/** METHODS */
async function handleSuccess({ receipt }) {
  isActionConfirmed.value = true;
  confirmationReceipt.value = receipt;
  await refetchStakedShares.value();
  await refetchUserStakingData.value();
  await refetchHasNonPrefGauge.value();
  await queryClient.refetchQueries(['staking']);
  emit('success');
}

async function txWithNotification(action: () => Promise<TransactionResponse>) {
  const tx = await action();
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: props.action,
    summary: t(`transactionSummary.${props.action}`, {
      pool: poolWeightsLabel(props.pool),
      amount: fNum2(fiatValueOfModifiedShares.value, FNumFormats.fiat),
    }),
    details: {
      total: fNum2(fiatValueOfModifiedShares.value, FNumFormats.fiat),
      pool: props.pool,
    },
  });
  return tx;
}

async function loadApprovalsForGauge() {
  isLoadingApprovalsForGauge.value = true;
  const gaugeAddress = await getGaugeAddress(props.pool.address);
  const approvalActions = await getTokenApprovalActionsForSpender(gaugeAddress);
  stakeActions.value.unshift(...approvalActions);
  isLoadingApprovalsForGauge.value = false;
}

function handleClose() {
  isActionConfirmed.value = false;
  confirmationReceipt.value = undefined;
  emit('close');
}
</script>

<template>
  <BalStack vertical>
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
    <BalCard shadow="none" noPad class="py-2 px-4">
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum2(shareBalanceToDisplay) }} {{ $t('lpTokens') }}</h5>
          <span class="text-secondary">
            {{ getToken(pool.address).symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="pool.tokensList"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </BalCard>
    <BalCard shadow="none" noPad>
      <div class="p-2 border-b dark:border-gray-900">
        <h6 class="text-sm">
          {{ $t('summary') }}
        </h6>
      </div>
      <BalStack vertical spacing="xs" class="p-3">
        <BalStack horizontal justify="between">
          <span class="text-sm">
            {{ $t('totalValueTo') }}
            <span class="lowercase">
              {{ action === 'stake' ? $t('stake') : $t('unstake') }}:
            </span>
          </span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">
              ~{{ fNum2(fiatValueOfModifiedShares, FNumFormats.fiat) }}
            </span>
            <BalTooltip
              :text="
                action === 'stake'
                  ? $t('staking.stakeValueTooltip')
                  : $t('staking.unstakeValueTooltip')
              "
              width="40"
              textAlign="center"
            />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.newTotalShare') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">
              ~{{ fNum2(totalUserPoolSharePct, FNumFormats.percent) }}
            </span>
            <BalTooltip
              :text="$t('staking.totalShareTooltip')"
              width="40"
              textAlign="center"
            />
          </BalStack>
        </BalStack>
      </BalStack>
    </BalCard>
    <BalActionSteps
      v-if="!isActionConfirmed"
      :actions="stakeActions"
      :isLoading="isLoadingApprovalsForGauge"
      @success="handleSuccess"
    />
    <BalStack v-if="isActionConfirmed && confirmationReceipt" vertical>
      <ConfirmationIndicator :txReceipt="confirmationReceipt" />
      <AnimatePresence :isVisible="isActionConfirmed">
        <BalBtn
          v-if="action === 'stake'"
          color="gradient"
          block
          class="mb-2"
          @click="$router.push({ name: 'claim' })"
        >
          {{ $t('viewClaims') }}
        </BalBtn>
        <BalBtn color="gray" outline block @click="handleClose">
          {{ $t('close') }}
        </BalBtn>
      </AnimatePresence>
    </BalStack>
  </BalStack>
</template>
