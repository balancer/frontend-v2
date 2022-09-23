<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import useStaking from '@/composables/staking/useStaking';
import useNumbers from '@/composables/useNumbers';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { PoolMigrationInfo } from '../../types';
import MigratePreviewModal from '../MigratePreviewModal/MigratePreviewModal.vue';
import PoolInfoBreakdown from './components/PoolInfoBreakdown.vue';
import useTokens from '@/composables/useTokens';
import { fiatValueOf } from '@/composables/usePool';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  fromPool: Pool;
  toPool: Pool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fromPool, toPool } = toRefs(props);
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();

const {
  userData: { stakedSharesForProvidedPool },
} = useStaking();

const fiatValueOfStakedShares = computed(() => {
  const stakedShares = (stakedSharesForProvidedPool.value || 0).toString();
  return fiatValueOf(props.fromPool, stakedShares);
});

const fiatValueOfUnstakedShares = computed(() => {
  return fiatValueOf(props.fromPool, balanceFor(props.fromPool.address));
});

const unstakedBptBalance = computed(() => {
  return balanceFor(props.fromPool.address);
});

const hasValue = computed(
  () =>
    Number(fiatValueOfUnstakedShares.value) > 0 ||
    Number(fiatValueOfStakedShares.value) > 0
);

const balanceLabel = computed(() => {
  let balance = 0;
  const stakedAmount = Number(fiatValueOfStakedShares.value);
  const unstakedAmount = Number(fiatValueOfUnstakedShares.value);

  balance = stakedAmount + unstakedAmount;

  return balance > 0
    ? fNum2(balance, {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      })
    : '-';
});

/**
 * STATE
 */
const showPreviewModal = ref(false);
const migrateStakeChooseArr = ref({
  staked: {
    title: t('migratePool.poolInfo.stakedLabel'),
    value: true,
    amount: computed(() =>
      fNum2(fiatValueOfStakedShares.value, {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      })
    ),
  },
  unstaked: {
    title: t('migratePool.poolInfo.unstakedLabel'),
    value: true,
    amount: computed(() =>
      fNum2(fiatValueOfUnstakedShares.value, {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      })
    ),
  },
});

/**
 * COMPUTED
 */
const isPreviewModalBtnDisabled = computed(() => {
  return (
    !hasValue.value ||
    (hasStakedUnstakedLiquidity.value &&
      Object.values(migrateStakeChooseArr.value).every(item => !item.value))
  );
});

const hasStakedUnstakedLiquidity = computed(() => {
  return (
    Number(fiatValueOfUnstakedShares.value) > 0 &&
    Number(fiatValueOfStakedShares.value) > 0
  );
});

const isStakedMigrationEnabled = computed(() => {
  if (hasStakedUnstakedLiquidity.value) {
    return migrateStakeChooseArr.value.staked.value;
  }

  return Number(fiatValueOfStakedShares.value) > 0;
});

const isUnstakedMigrationEnabled = computed(() => {
  if (hasStakedUnstakedLiquidity.value) {
    return migrateStakeChooseArr.value.unstaked.value;
  }

  return Number(fiatValueOfUnstakedShares.value) > 0;
});
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs leading-none text-secondary">
          {{ configService.network.chainName }}
        </div>
        <div class="flex justify-between items-center">
          <h4>
            {{ t(`migratePool.${poolMigrationInfo.type}.migrateToPool.title`) }}
          </h4>
          <TradeSettingsPopover :context="TradeSettingsContext.invest" />
        </div>
      </div>
    </template>
    <div v-if="hasStakedUnstakedLiquidity" class="pb-4">
      {{ t('migratePool.poolInfo.stakedUnstaked') }}
      <BalCheckbox
        v-for="(item, index) in Object.values(migrateStakeChooseArr)"
        :key="index"
        class="pt-3"
        :modelValue="item.value"
        name="areFeesGovernanceManaged"
        size="lg"
        noMargin
        @update:model-value="item.value = !item.value"
      >
        <template #label>
          <div class="flex flex-col text-base">
            <div class="font-semibold">
              {{ item.title }}
            </div>
            <div class="text-sm font-normal text-secondary">
              {{ item.amount }}
            </div>
          </div>
        </template>
      </BalCheckbox>
    </div>
    <div v-if="!hasStakedUnstakedLiquidity" class="mb-6">
      <div class="text-gray-500">{{ $t('yourBalanceInPool') }}</div>
      <div class="text-lg font-semibold">
        {{ balanceLabel }}
      </div>
    </div>
    <PoolInfoBreakdown :pool="fromPool" :poolTokenInfo="fromPoolTokenInfo" />
    <div class="flex justify-center my-4 dark:text-gray-50">
      <ArrowDownIcon class="w-5 h-5 dark:text-secondary" />
    </div>
    <PoolInfoBreakdown :pool="toPool" :poolTokenInfo="toPoolTokenInfo" />
    <BalBtn
      color="gradient"
      class="mt-6"
      block
      :disabled="isPreviewModalBtnDisabled"
      @click="showPreviewModal = true"
    >
      {{ $t('previewMigrate') }}
    </BalBtn>
  </BalCard>

  <teleport to="#modal">
    <MigratePreviewModal
      v-if="showPreviewModal"
      :stakedPoolValue="fiatValueOfStakedShares"
      :unstakedPoolValue="fiatValueOfUnstakedShares"
      :isStakedMigrationEnabled="isStakedMigrationEnabled"
      :isUnstakedMigrationEnabled="isUnstakedMigrationEnabled"
      :stakedBptBalance="stakedSharesForProvidedPool"
      :unstakedBptBalance="unstakedBptBalance"
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :poolMigrationInfo="poolMigrationInfo"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
