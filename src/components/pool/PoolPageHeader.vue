<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import BalChipNew from '@/components/chips/BalChipNew.vue';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useApp from '@/composables/useApp';
import useNumbers from '@/composables/useNumbers';
import { usePoolWarning } from '@/composables/usePoolWarning';
import useTokens from '@/composables/useTokens';
import { EXTERNAL_LINKS } from '@/constants/links';
import { POOLS } from '@/constants/pools';
import { includesAddress } from '@/lib/utils';
import { OnchainTokenData, Pool, PoolAPRs } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  loadingPool: boolean;
  loadingApr: boolean;
  noInitLiquidity: boolean;
  isStableLikePool: boolean;
  pool: Pool;
  poolApr: PoolAPRs;
  titleTokens: [string, OnchainTokenData][];
  missingPrices: boolean;
  isLiquidityBootstrappingPool: boolean;
  isStablePhantomPool: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  loadingPool: true,
  loadingApr: true,
  noInitLiquidity: false,
});

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const route = useRoute();
const { isAffected, warnings } = usePoolWarning(route.params.id as string);
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { explorerLinks: explorer } = useWeb3();
const { balancerTokenListTokens } = useTokens();

/**
 * STATE
 */
const data = reactive({
  id: route.params.id as string,
});

/**
 * COMPUTED
 */
const feesFixed = computed(() => props.pool?.owner == POOLS.ZeroAddress);

const communityManagedFees = computed(
  () => props.pool?.owner == POOLS.DelegateOwner,
);
const feesManagedByGauntlet = computed(
  () =>
    communityManagedFees.value && POOLS.DynamicFees.Gauntlet.includes(data.id),
);
const swapFeeToolTip = computed(() => {
  if (feesManagedByGauntlet.value) {
    return t('feesManagedByGauntlet');
  } else if (communityManagedFees.value) {
    return t('delegateFeesTooltip');
  } else if (feesFixed.value) {
    return t('fixedFeesTooltip');
  } else {
    return t('ownerFeesTooltip');
  }
});

const poolFeeLabel = computed(() => {
  if (!props.pool || !props.pool?.onchain?.swapFee) return '';

  const feeLabel = `${fNum2(props.pool.onchain.swapFee, {
    style: 'percent',
    maximumFractionDigits: 4,
  })}`;

  if (feesFixed.value) {
    return t('fixedSwapFeeLabel', [feeLabel]);
  } else if (communityManagedFees.value) {
    return feesManagedByGauntlet.value
      ? t('dynamicSwapFeeLabel', [feeLabel])
      : t('communitySwapFeeLabel', [feeLabel]);
  }

  // Must be owner-controlled
  return t('dynamicSwapFeeLabel', [feeLabel]);
});

const hasCustomToken = computed(() => {
  const knownTokens = Object.keys(balancerTokenListTokens.value);
  return (
    !!props.pool &&
    !props.isLiquidityBootstrappingPool &&
    !props.isStablePhantomPool &&
    props.pool.tokensList.some(
      address => !includesAddress(knownTokens, address),
    )
  );
});

const poolTypeLabel = computed(() => {
  if (!props.pool) return '';
  const key = POOLS.Factories[props.pool.factory];

  return key ? t(key) : t('unknownPoolType');
});
</script>

<template>
  <div class="col-span-2 px-4 lg:px-0">
    <BalLoadingBlock v-if="loadingPool" class="h-16" />
    <div v-else class="flex flex-col">
      <div class="flex flex-wrap items-center -mt-2">
        <h3 class="pool-title">
          {{ poolTypeLabel }}
        </h3>
        <div
          v-for="([address, tokenMeta], i) in titleTokens"
          :key="i"
          class="mt-2 mr-2 flex items-center px-2 h-10 bg-gray-50 dark:bg-gray-850 rounded-lg"
        >
          <BalAsset :address="address" />
          <span class="ml-2">
            {{ tokenMeta.symbol }}
          </span>
          <span
            v-if="!isStableLikePool"
            class="font-medium text-gray-400 text-xs mt-px ml-1"
          >
            {{
              fNum2(tokenMeta.weight, {
                style: 'percent',
                maximumFractionDigits: 0,
              })
            }}
          </span>
        </div>
        <BalChipNew v-if="pool?.isNew" class="mt-2 mr-2" />
        <APRTooltip
          v-if="!loadingApr"
          :pool="pool"
          :pool-apr="poolApr"
          class="-ml-1 mt-1"
        />
        <BalLink
          :href="explorer.addressLink(pool?.address || '')"
          external
          noStyle
          class="flex items-center"
        >
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-2 mt-2 text-gray-500 hover:text-blue-500 transition-colors"
          />
        </BalLink>
      </div>
      <div class="flex items-center mt-2">
        <div v-html="poolFeeLabel" class="text-sm text-secondary mr-1" />
        <BalTooltip>
          <template v-slot:activator>
            <BalLink
              v-if="feesManagedByGauntlet"
              :href="EXTERNAL_LINKS.Gauntlet.Home"
              external
            >
              <GauntletIcon />
            </BalLink>
            <BalIcon
              v-else
              name="info"
              size="xs"
              class="text-gray-400 dark:text-gray-500"
            />
          </template>
          <span>
            {{ swapFeeToolTip }}
          </span>
        </BalTooltip>
      </div>
    </div>

    <BalAlert
      v-if="!appLoading && !loadingPool && missingPrices"
      type="warning"
      :title="$t('noPriceInfo')"
      class="mt-2"
      block
    />
    <BalAlert
      v-if="!appLoading && !loadingPool && hasCustomToken"
      type="error"
      :title="$t('highRiskPool')"
      class="mt-2"
      block
    />
    <template v-if="!appLoading && !loadingPool && isAffected">
      <BalAlert
        v-for="(warning, i) in warnings"
        :key="`warning-${i}`"
        type="error"
        class="mt-2"
        block
      >
        <template #title>
          <div v-html="warning.title" />
        </template>
        <template #description>
          <div v-html="warning.description" />
        </template>
      </BalAlert>
    </template>
    <BalAlert
      v-if="!appLoading && noInitLiquidity"
      type="warning"
      :title="$t('noInitLiquidity')"
      :description="$t('noInitLiquidityDetail')"
      class="mt-2"
      block
    />
  </div>
</template>
<style scoped>
.pool-title {
  @apply mr-4 capitalize mt-2;
  font-variation-settings: 'wght' 700;
}
</style>
