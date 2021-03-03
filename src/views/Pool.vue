<template>
  <Layout class="mt-4">
    <template v-slot:content-left>
      <div class="px-4 md:px-0">
        <Breadcrumb />
        <h1 class="mb-5">
          {{ $t('pool') }} {{ _shorten(id) }}
          <a v-clipboard:copy="id" v-clipboard:success="handleCopy">
            <Icon name="copy" size="24" class="text-gray" />
          </a>
        </h1>
      </div>
      <div v-if="loading || registry.loading" class="px-4 md:px-0">
        <UiLoading />
      </div>
      <div v-else>
        <!--
        <div class="mb-5 relative">
          <div class="text-right">
            <a @click="loadMarketCharts(1)" class="mr-2">
              <UiLabel
                v-text="$t('oneDay')"
                :class="marketChartsDays === 1 && 'active'"
              />
            </a>
            <a @click="loadMarketCharts(7)" class="mr-2">
              <UiLabel
                v-text="$t('oneWeek')"
                :class="marketChartsDays === 7 && 'active'"
              />
            </a>
            <a @click="loadMarketCharts(30)" class="mr-2">
              <UiLabel
                v-text="$t('oneMonth')"
                :class="marketChartsDays === 30 && 'active'"
              />
            </a>
            <a @click="loadMarketCharts(90)" class="mr-2">
              <UiLabel
                v-text="$t('threeMonths')"
                :class="marketChartsDays === 90 && 'active'"
              />
            </a>
          </div>
          <UiLoading
            v-if="marketChartsLoading"
            class="absolute mt-n4"
          />
          <Chart :key="marketCharts[0].length" :marketCharts="marketCharts" />
        </div>
        -->
        <Block :title="$t('overview')">
          <div class="flex">
            <div v-text="$t('poolTokenName')" class="flex-auto" />
            {{ tokens[pool.address].name }}
            <a @click="addToken" class="ml-1 mb-n1 mr-n1">
              <Icon name="plus" size="22" />
            </a>
          </div>
          <div class="flex">
            <div v-text="$t('totalSupply')" class="flex-auto" />
            {{ _num(_units(pool.totalSupply, tokens[pool.address].decimals)) }}
            {{ tokens[pool.address].symbol }}
          </div>
          <div class="flex">
            <div v-text="$t('poolType')" class="flex-auto" />
            {{ $t(pool.strategy.name) }}
          </div>
          <div v-if="pool.strategy.swapFee" class="flex">
            <div v-text="$t('swapFee')" class="flex-auto" />
            {{ _num(pool.strategy.swapFeePercent) }}%
          </div>
        </Block>
        <BlockPoolTokens
          :tokens="getTokens({ addresses: pool.tokens })"
          :tokenBalances="pool.tokenBalances"
          :tokenWeights="pool.strategy.weightsPercent || []"
        />
      </div>
    </template>
    <template v-slot:sidebar-right>
      <div v-if="pool && !loading && !registry.loading">
        <BlockPoolActions
          @joinPool="onJoinPool"
          @exitPool="onExitPool"
          @approve="onApprove"
          :hasAllowed="hasAllowed"
          :tokens="tokens"
          :pool="pool"
        />
      </div>
    </template>
  </Layout>
</template>

<script>
import getProvider from '@/utils/provider';
import { parseUnits } from '@ethersproject/units';
import { mapActions, mapGetters } from 'vuex';
import { getPool } from '@/utils/balancer/pools';
import { approveTokens } from '@/utils/balancer/tokens';
import {
  encodeExitWeightedPool,
  encodeJoinWeightedPool
} from '@/utils/balancer/weightedPoolEncoding';
import { exitPool, joinPool } from '@/utils/balancer/vault';
import { encodeJoinStablePool } from '@/utils/balancer/stablePoolEncoding';

export default {
  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      pool: false,
      hasAllowed: false,
      marketCharts: [],
      marketChartsDays: 7,
      marketChartsLoading: false
    };
  },
  computed: {
    ...mapGetters(['getTokens']),
    tokens() {
      return this.getTokens();
    }
  },
  methods: {
    ...mapActions(['notify', 'injectTokens', 'watchTx']),
    handleCopy() {
      this.notify(this.$t('copied'));
    },
    async loadPool() {
      this.pool = await getPool(
        this.web3.config.key,
        getProvider(this.web3.config.key),
        this.id
      );
    },
    async onApprove(data) {
      try {
        const tx = await approveTokens(
          this.$auth.web3,
          this.web3.config.addresses.vault,
          Object.keys(data)
        );
        console.log(tx);

        this.hasAllowed = true;
      } catch (e) {
        console.log(e);
      }
    },
    async onJoinPool(data) {
      const network = this.web3.config.key;
      const poolId = this.id;
      const recipient = this.web3.account;
      const tokens = this.pool.tokens;
      const maxAmountsIn = this.pool.tokens.map((token, i) =>
        parseUnits(data.sendAmounts[i], this.tokens[token].decimals).toString()
      );
      const fromInternalBalance = false;

      let userData;
      if (this.pool.strategy.name === 'weightedPool') {
        if (this.pool.totalSupply.toString() === '0') {
          console.log('Join weighted pool for the first time');
          userData = encodeJoinWeightedPool({
            kind: 'Init',
            amountsIn: maxAmountsIn
          });
        } else {
          const slippageTolerance = this.app.slippage;
          const receiveAmount = parseFloat(data.receiveAmounts[0]);
          const poolAmountOut = (
            receiveAmount *
            (1 - slippageTolerance)
          ).toFixed(this.tokens[this.pool.address].decimals);
          const minimumBPT = parseUnits(
            poolAmountOut,
            this.tokens[this.pool.address].decimals
          );
          userData = encodeJoinWeightedPool({
            amountsIn: maxAmountsIn,
            minimumBPT
          });
        }
      } else if (this.pool.strategy.name === 'stablePool') {
        if (this.pool.totalSupply.toString() === '0') {
          userData = encodeJoinStablePool({
            kind: 'Init',
            amountsIn: maxAmountsIn
          });
        } else {
          const slippageTolerance = this.app.slippage;
          const receiveAmount = parseFloat(data.receiveAmounts[0]);
          const poolAmountOut = (
            receiveAmount *
            (1 - slippageTolerance)
          ).toFixed(this.tokens[this.pool.address].decimals);
          const minimumBPT = parseUnits(
            poolAmountOut,
            this.tokens[this.pool.address].decimals
          );
          userData = encodeJoinStablePool({
            amountsIn: maxAmountsIn,
            minimumBPT
          });
        }
      }

      const params = [
        poolId,
        recipient,
        tokens,
        maxAmountsIn,
        fromInternalBalance,
        userData
      ];
      console.log(params);

      try {
        const tx = await joinPool(network, this.$auth.web3, params);
        await this.watchTx(tx);
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        this.notify(this.$t('youDidIt'));
        await this.loadPool();
      } catch (e) {
        console.log(e);
      }
    },
    async onExitPool(data) {
      const network = this.web3.config.key;
      const poolId = this.id;
      const recipient = this.web3.account;
      const tokens = this.pool.tokens;
      const minAmountsOut = this.pool.tokens.map((token, i) => {
        const slippageTolerance = this.app.slippage;
        const receiveAmount = parseFloat(data.receiveAmounts[i]);
        const poolAmountOut = (receiveAmount * (1 - slippageTolerance)).toFixed(
          this.tokens[token].decimals
        );
        return parseUnits(
          poolAmountOut,
          this.tokens[token].decimals
        ).toString();
      });
      const toInternalBalance = false;

      const [poolAmountIn] = data.sendAmounts;
      const bptAmountIn = parseUnits(
        poolAmountIn,
        this.tokens[this.pool.address].decimals
      );
      const userData = encodeExitWeightedPool({
        kind: 'ExactBPTInForAllTokensOut',
        bptAmountIn
      });

      const params = [
        poolId,
        recipient,
        tokens,
        minAmountsOut,
        toInternalBalance,
        userData
      ];
      console.log(params);

      try {
        const tx = await exitPool(network, this.$auth.web3, params);
        await this.watchTx(tx);
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        this.notify(this.$t('youDidIt'));
        await this.loadPool();
      } catch (e) {
        console.log(e);
      }
    },
    async addToken() {
      const address = this.pool.address;
      // @ts-ignore
      await this.$auth.provider.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: this.tokens[address].symbol.slice(0, 6),
            decimals: this.tokens[address].decimals
          }
        },
        id: Math.round(Math.random() * 100000)
      });
    },
    async loadMarketCharts(days) {
      this.marketChartsLoading = true;
      this.marketChartsDays = days;
      this.marketCharts = {};
      this.marketChartsLoading = false;
    }
  },
  async created() {
    this.loading = true;
    await this.loadPool();
    await this.injectTokens([...this.pool.tokens, this.pool.address]);
    // await this.loadMarketCharts(7);
    this.loading = false;
  }
};
</script>
