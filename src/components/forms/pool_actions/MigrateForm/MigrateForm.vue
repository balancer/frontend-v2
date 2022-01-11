<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { bnum } from '@/lib/utils';

import { configService } from '@/services/config/config.service';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { FullPool } from '@/services/balancer/subgraph/types';

import usePoolQuery from '@/composables/queries/usePoolQuery';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useTokens from '@/composables/useTokens';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import TradeSettingsPopover, {
  TradeSettingsContext
} from '@/components/popovers/TradeSettingsPopover.vue';

import MigratePreviewModal from './components/MigratePreviewModal/MigratePreviewModal.vue';
import MigrateExplainer from './components/MigrateExplainer.vue';
import PoolStats from './components/PoolStats.vue';
import PoolInfoBreakdown from './components/PoolInfoBreakdown.vue';

import { PoolMigrationInfo } from './types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { tokens, balanceFor, balances } = useTokens();
const showPreviewModal = ref(false);

/**
 * QUERIES
 */
const fromPoolQuery = usePoolQuery(props.poolMigrationInfo.fromPoolId);
const toPoolQuery = usePoolQuery(props.poolMigrationInfo.toPoolId);

/**
 * COMPUTED
 */
const fromPoolLoading = computed(
  () => fromPoolQuery.isLoading.value || fromPoolQuery.isIdle.value
);

const toPoolLoading = computed(
  () => toPoolQuery.isLoading.value || toPoolQuery.isIdle.value
);

const isLoadingPools = computed(
  () => toPoolLoading.value || fromPoolLoading.value
);

const fromPool = computed<FullPool | undefined>(() => fromPoolQuery.data.value);

const toPool = computed<FullPool | undefined>(() => toPoolQuery.data.value);

const totalFiatPoolInvestment = computed(() => {
  if (fromPool.value == null) {
    return '0';
  }

  const poolCalculator = new PoolCalculator(
    fromPool as Ref<FullPool>,
    tokens,
    balances,
    'exit',
    ref(false)
  );

  const { receive } = poolCalculator.propAmountsGiven(
    balanceFor(fromPool.value.address),
    0,
    'send'
  );

  return fromPool.value.tokenAddresses
    .map((address, i) => toFiat(receive[i], address))
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );
});

const hasPoolInvestment = computed(
  () => Number(totalFiatPoolInvestment.value) > 0
);

const fromPoolTokenInfo = computed(() =>
  fromPool.value != null ? tokens.value[fromPool.value.address] : null
);

const toPoolTokenInfo = computed(() =>
  toPool.value != null ? tokens.value[toPool.value.address] : null
);
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <MigrateExplainer :poolMigrationInfo="poolMigrationInfo" />
    </template>

    <BalLoadingBlock
      v-if="
        isLoadingPools || fromPoolTokenInfo == null || toPoolTokenInfo == null
      "
      class="h-96"
    />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs text-gray-500 leading-none">
            {{ configService.network.chainName }}
          </div>
          <div class="flex items-center justify-between">
            <h4>
              {{
                t(`migratePool.${poolMigrationInfo.type}.migrateToPool.title`)
              }}
            </h4>
            <TradeSettingsPopover :context="TradeSettingsContext.invest" />
          </div>
        </div>
      </template>
      <div class="mb-6">
        <div class="text-gray-500">{{ $t('yourBalanceInPool') }}</div>
        <div class="font-semibold">
          {{
            hasPoolInvestment ? fNum(totalFiatPoolInvestment, currency) : '-'
          }}
        </div>
      </div>
      <PoolInfoBreakdown :pool="fromPool" :poolTokenInfo="fromPoolTokenInfo" />
      <div class="block flex justify-center my-5">
        <ArrowDownIcon />
      </div>
      <PoolInfoBreakdown :pool="toPool" :poolTokenInfo="toPoolTokenInfo" />
      <BalBtn
        color="gradient"
        block
        :disabled="!hasPoolInvestment"
        @click="showPreviewModal = true"
      >
        {{ $t('previewMigrate') }}
      </BalBtn>
    </BalCard>

    <template #gutterRight>
      <PoolStats
        :isLoading="toPoolLoading"
        :pool="toPool"
        :poolMigrationInfo="poolMigrationInfo"
      />
    </template>
  </Col3Layout>
  <teleport to="#modal">
    <MigratePreviewModal
      v-if="showPreviewModal"
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :poolMigrationInfo="poolMigrationInfo"
      :totalFiatPoolInvestment="totalFiatPoolInvestment"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
