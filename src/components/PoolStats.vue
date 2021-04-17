<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    <div v-for="(stat, i) in stats" :key="i">
      <BalLoadingBlock v-if="loading" class="h-24" />
      <BalCard v-else>
        <div class="text-xs uppercase text-gray-500 font-medium mb-3">
          {{ stat.label }}
        </div>
        <div class="text-xl font-medium">
          {{ stat.value }}
        </div>
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { formatUnits } from '@ethersproject/units';
import { PoolSnapshots } from '@/api/subgraph';
import useNumbers from '@/composables/useNumbers';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { useI18n } from 'vue-i18n';

const DAY = 24 * 60 * 60;

export default defineComponent({
  props: {
    pool: {
      type: Object,
      default: () => ({})
    },
    snapshots: {
      type: Object as PropType<PoolSnapshots>,
      required: true
    },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { t } = useI18n();

    // DATA
    const { pool, snapshots } = toRefs(props);

    // COMPUTED
    const allTokens = computed(() => store.getters['registry/getTokens']());

    const subgraphPool = computed(() => {
      const strategy = pool.value.strategy.name;
      if (strategy !== 'weightedPool') {
        return {};
      }
      const poolType = 'Weighted';
      const tokens = pool.value.tokens.map((tokenAddress, index) => {
        const address = tokenAddress.toLowerCase();
        const weight = pool.value.weights[index].toString();
        const token = allTokens.value[address];
        const decimals = token ? token.decimals : 18;
        const balance = formatUnits(pool.value.tokenBalances[index], decimals);
        return {
          address,
          weight,
          balance
        };
      });
      return {
        poolType,
        tokens
      } as any;
    });

    const liquidity = computed(() =>
      parseFloat(
        getPoolLiquidity(subgraphPool.value, store.state.market.prices)
      )
    );

    const weekSnapshots = computed(() => {
      const weekSnapshots = Object.values(snapshots.value).filter(snapshot => {
        const timestamp = Date.now() / 1000;
        const weekTimestamp = timestamp - 7 * DAY;
        return snapshot.timestamp >= weekTimestamp;
      });
      return weekSnapshots;
    });

    const volume = computed(() => {
      const volume = weekSnapshots.value.reduce(
        (total, snapshot) => total + parseFloat(snapshot.swapVolume),
        0
      );
      return volume;
    });

    const fees = computed(() => {
      const fees = weekSnapshots.value.reduce(
        (total, snapshot) => total + parseFloat(snapshot.swapFees),
        0
      );
      return fees;
    });

    const apy = computed(() => (fees.value / liquidity.value / 7) * 365);

    const stats = computed(() => {
      return [
        {
          label: t('poolValue'),
          value: fNum(liquidity.value, 'usd')
        },
        {
          label: t('volumeTime', ['7d']),
          value: fNum(volume.value, 'usd')
        },
        {
          label: t('feesTime', ['7d']),
          value: fNum(fees.value, 'usd')
        },
        {
          label: t('apy', [t('yearAbbrev')]),
          value: fNum(apy.value, 'percent')
        }
      ];
    });

    return {
      stats
    };
  }
});
</script>
