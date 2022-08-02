<script setup lang="ts">
import { computed, onBeforeMount, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import useStaking from '@/composables/staking/useStaking';
import useNumbers from '@/composables/useNumbers';
import { MIN_FIAT_VALUE_POOL_MIGRATION } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import useMigrateMath from '../../composables/useMigrateMath';
import { PoolMigrationInfo } from '../../types';
import MigratePreviewModal from '../MigratePreviewModal/MigratePreviewModal.vue';
import PoolInfoBreakdown from './components/PoolInfoBreakdown.vue';

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

const {
  userData: {
    stakedPools,
    isLoadingUserStakingData,
    isLoadingStakedPools,
    isLoadingUserPools,
    poolBoosts,
  },
} = useStaking();

const poolsWithBoost = computed(() => {
  console.log('poolBoosts', poolBoosts);
  return stakedPools.value.map(pool => ({
    ...pool,
    boost: (poolBoosts.value || {})[pool.id],
  }));
});

const stakedPool = computed(() => {
  return poolsWithBoost.value.find(pool => pool.id === fromPool.value.id);
});

const router = useRouter();

const migrateMath = useMigrateMath(fromPool, toPool);
const { fiatTotal } = migrateMath;

const hasValue = computed(
  () => Number(stakedPool.value?.shares) > 0 || Number(fiatTotal.value) > 0
);

const balanceLabel = computed(() => {
  let balance = 0;

  if (stakedPool.value) {
    balance += Number(stakedPool.value?.shares);
  }

  if (Number(fiatTotal.value) > 0) {
    balance += Number(fiatTotal.value);
  }

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
    value: Number(stakedPool.value?.shares) > 0,
    amount: fNum2(stakedPool.value?.shares || '0', {
      style: 'currency',
      maximumFractionDigits: 0,
      fixedFormat: true,
    }),
  },
  unstaked: {
    title: t('migratePool.poolInfo.unstakedLabel'),
    value: Number(fiatTotal.value) > 0,
    amount: fNum2(fiatTotal.value, {
      style: 'currency',
      maximumFractionDigits: 0,
      fixedFormat: true,
    }),
  },
});

/**
 * COMPUTED
 */
const isPreviewModalBtnDisabled = computed(() => {
  return (
    !hasValue.value ||
    Object.values(migrateStakeChooseArr.value).every(item => !item.value)
  );
});

const hasStakedUnstakedLiquidity = computed(() => {
  return Number(stakedPool.value?.shares) > 0 && Number(fiatTotal.value) > 0;
});

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  await migrateMath.getBatchSwap();

  if (bnum(fiatTotal.value).lt(MIN_FIAT_VALUE_POOL_MIGRATION)) {
    // router.push({ name: 'pool', params: { id: fromPool.value.id } });
  }
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
    <div v-if="hasStakedUnstakedLiquidity" class="pb-3">
      {{ t('migratePool.poolInfo.stakedUnstaked') }}
      <BalCheckbox
        v-for="(item, index) in Object.values(migrateStakeChooseArr)"
        :key="index"
        class="pt-2"
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
            <div class="font-normal text-gray-600">
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
      :stakedPoolValue="stakedPool?.shares"
      :isStakedMigrationEnabled="migrateStakeChooseArr.staked.value"
      :isUnstakedMigrationEnabled="migrateStakeChooseArr.unstaked.value"
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :poolMigrationInfo="poolMigrationInfo"
      :math="migrateMath"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
