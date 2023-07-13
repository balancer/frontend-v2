<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isLBP, totalAprLabel } from '@/composables/usePoolHelpers';
import { APR_THRESHOLD, VOLUME_THRESHOLD } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@sobal/sdk';
import { useCrossChainSync } from '@/providers/cross-chain-sync.provider';
import useNetwork from '@/composables/useNetwork';

/**
 * TYPES
 */
type Props = {
  pool?: Pool | null;
  poolApr: AprBreakdown | null;
  loading?: boolean;
  loadingApr?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pool: null,
  poolApr: null,
});

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { t } = useI18n();
const { l2VeBalBalances } = useCrossChainSync();
const { networkId } = useNetwork();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => {
  const poolAPRs = props.poolApr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool?.boost);
});

const syncVeBalTooltip = computed(() => {
  const vebalBalance = Number(l2VeBalBalances.value?.[networkId.value]);

  if (vebalBalance > 0) {
    return 'Remember to resync if you have acquired more veBAL since your last sync, to get a higher boosted staking rate. Resync on the veBAL page on Ethereum Mainnet.';
  }

  if (vebalBalance === 0) {
    return 'If you have veBAL, sync your balance on the veBAL page on Ethereum Mainnet to get higher boosted staking rates across L2 networks.';
  }

  return '';
});

const stats = computed(() => {
  const volumeSnapshot = Number(props.pool?.volumeSnapshot || '0');
  const feesSnapshot = Number(props.pool?.feesSnapshot || '0');
  return [
    {
      id: 'poolValue',
      label: t('poolValue'),
      value: fNum(props.pool?.totalLiquidity || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'volumeTime',
      label: t('volumeTime', ['24h']),
      value: fNum(
        volumeSnapshot > VOLUME_THRESHOLD ? '-' : volumeSnapshot,
        FNumFormats.fiat
      ),
      loading: props.loading,
    },
    {
      id: 'feesTime',
      label: t('feesTime', ['24h']),
      value: fNum(
        feesSnapshot > VOLUME_THRESHOLD ? '-' : feesSnapshot,
        FNumFormats.fiat
      ),
      loading: props.loading,
    },
    {
      id: 'apr',
      label: 'APR',
      value:
        Number(props.poolApr?.swapFees || '0') > APR_THRESHOLD
          ? '-'
          : aprLabel.value,
      loading: props.loadingApr,
      tooltip: syncVeBalTooltip.value,
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-for="stat in stats" :key="stat.id">
      <BalLoadingBlock v-if="stat.loading || !pool" class="h-24" />
      <BalCard v-else>
        <div class="flex mb-2 text-sm font-medium text-secondary">
          <span>{{ stat.label }}</span>
          <template v-if="stat.id === 'apr' && poolApr">
            <BalTooltip
              v-if="isLBP(pool.poolType)"
              width="36"
              :text="$t('lbpAprTooltip')"
              iconSize="sm"
              iconClass="ml-1"
            />
            <APRTooltip v-else :pool="pool" :poolApr="poolApr" />
          </template>
        </div>
        <div
          :class="[
            'flex items-center text-xl font-medium',
            {
              'text-gray-300 dark:text-gray-600 line-through':
                stat.id === 'apr' && isLBP(pool.poolType),
            },
          ]"
        >
          <span :class="{ 'mr-2': stat.tooltip }">{{ stat.value }}</span>
          <BalTooltip v-if="stat.tooltip" :text="stat.tooltip">
            <template #activator>
              <BalIcon name="info" size="sm" class="text-gray-400" />
            </template>
          </BalTooltip>
        </div>
      </BalCard>
    </template>
  </div>
</template>
