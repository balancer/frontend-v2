<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTokens from '@/composables/useTokens';
import useStaking from '@/composables/staking/useStaking';
import { useI18n } from 'vue-i18n';

import { bnum } from '@/lib/utils';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import { TransactionActionInfo } from '@/types/transactions';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { getAddress } from 'ethers/lib/utils';
import { useQueryClient } from 'vue-query';

export type StakeAction = 'stake' | 'unstake';
type Props = {
  pool: DecoratedPoolWithShares;
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

const {
  stakeBPT,
  unstakeBPT,
  getGaugeAddress,
  stakedSharesForProvidedPool,
  refetchStakedShares,
  refetchStakingData,
  hideAprInfo
} = useStaking();
const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  [props.pool.address],
  ref([balanceFor(props.pool.address).toString()])
);

const stakeAction = {
  label: t('stake'),
  loadingLabel: t('staking.staking'),
  confirmingLabel: t('confirming'),
  action: stakeBPT,
  stepTooltip: t('staking.stakeTooltip')
};

const unstakeAction = {
  label: t('unstake'),
  loadingLabel: t('staking.unstaking'),
  confirmingLabel: t('confirming'),
  action: unstakeBPT,
  stepTooltip: t('staking.unstakeTooltip')
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
    stakeActions.value =
      props.action === 'stake' ? [stakeAction] : [unstakeAction];
  },
  { immediate: true }
);

/* COMPUTED */
const assetRowWidth = computed(
  () => (props.pool.tokenAddresses.length * 32) / 1.5
);

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
  await refetchStakingData.value();
  await queryClient.refetchQueries(['staking']);
  emit('success');
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
    <BalCard shadow="none" noPad class="px-4 py-2">
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum2(shareBalanceToDisplay) }} {{ $t('lpTokens') }}</h5>
          <span class="text-gray-500">
            {{ getToken(pool.address).symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="pool.tokenAddresses"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </BalCard>
    <BalCard shadow="none" noPad>
      <div class="border-b p-2">
        <h6 class="text-sm">{{ $t('summary') }}</h6>
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
              width="20"
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
              width="20"
              textAlign="center"
            />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between" v-if="!hideAprInfo">
          <span class="text-sm">
            {{ action === 'stake' ? $t('potential') : $t('lost') }}
            {{ $t('staking.stakingApr') }}:
          </span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">0</span>
            <BalTooltip text="s" width="20" textAlign="center" />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between" v-if="!hideAprInfo">
          <span class="text-sm">
            {{ action === 'stake' ? $t('potential') : $t('lost') }}
            {{ $t('staking.weeklyEarning') }}:
          </span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">0</span>
            <BalTooltip text="s" width="20" textAlign="center" />
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
    <BalStack vertical v-if="isActionConfirmed">
      <ConfirmationIndicator :txReceipt="confirmationReceipt" />
      <AnimatePresence :isVisible="isActionConfirmed">
        <BalBtn @click="handleClose" color="gray" outline block>
          {{ $t('close') }}
        </BalBtn>
      </AnimatePresence>
    </BalStack>
  </BalStack>
</template>
