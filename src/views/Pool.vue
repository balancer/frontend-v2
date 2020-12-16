<template>
  <Container :slim="true">
    <div class="px-4 px-md-0 mb-3">
      <router-link :to="{ name: 'home' }" class="text-gray">
        <Icon name="back" size="22" class="v-align-middle" />
        Home
      </router-link>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div class="px-4 px-md-0">
          <h1 class="mb-4">
            Pool {{ _shorten(id) }}
            <a v-clipboard:copy="id" v-clipboard:success="handleCopy">
              <Icon
                name="copy"
                size="24"
                class="text-gray line-height-0 p-0 m-0"
              />
            </a>
          </h1>
          <div v-if="pool && !loading && !registry.loading">
            <Block title="Controller">
              <div class="d-flex">
                <div class="flex-auto">
                  Address
                </div>
                <User :address="pool.controller" />
              </div>
              <div v-if="pool.tokenizer">
                <div class="d-flex">
                  <div class="flex-auto">
                    Name
                  </div>
                  {{ pool.tokenizer.name }}
                </div>
                <div class="d-flex">
                  <div class="flex-auto">
                    Total supply
                  </div>
                  {{
                    _numeral(
                      _units(
                        pool.tokenizer.totalSupply,
                        pool.tokenizer.decimals
                      )
                    )
                  }}
                  {{ pool.tokenizer.symbol }}
                </div>
              </div>
            </Block>
            <Block title="Trading strategy">
              <div class="d-flex">
                <div class="flex-auto">
                  {{ pool.strategy.name }}
                  ({{ pool.strategy.type }})
                </div>
                <User :address="pool.strategy.address" />
              </div>
              <div v-if="pool.strategy.swapFee" class="d-flex">
                <div class="flex-auto">
                  Swap fee
                </div>
                {{ _numeral(pool.strategy.swapFeePercent) }}%
              </div>
              <div v-if="pool.strategy.totalTokens" class="d-flex">
                <div class="flex-auto">
                  Total tokens
                </div>
                {{ _numeral(pool.strategy.totalTokens) }}
              </div>
              <div v-if="pool.strategy.weightsPercent" class="d-flex">
                <div class="flex-auto">
                  Weights
                </div>
                <div>
                  <span
                    v-for="(weight, i) in pool.strategy.weightsPercent"
                    :key="i"
                  >
                    {{ _numeral(weight) }}%
                    <span v-if="i + 1 !== pool.strategy.weightsPercent.length"
                      >/</span
                    >
                  </span>
                </div>
              </div>
            </Block>
            <BlockPoolTokens
              :tokens="getTokens({ addresses: pool.tokens })"
              :tokenBalances="pool.tokenBalances"
              :tokenWeights="pool.strategy.weightsPercent || []"
            />
          </div>
        </div>
      </div>
      <div
        v-if="pool && !loading && !registry.loading && pool.tokenizer"
        class="col-12 col-lg-4 float-left"
      >
        <BlockPoolActions
          @joinPool="onJoinPool"
          @exitPool="onExitPool"
          :tokens="getTokens()"
          :pool="pool"
        />
      </div>
    </div>
  </Container>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { parseUnits } from '@ethersproject/units';
import { mapActions, mapGetters } from 'vuex';
import { exitPool, getPool, joinPool } from '@/utils/balancer/utils/pools';

export default {
  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      pool: false
    };
  },
  computed: {
    ...mapGetters(['getTokens'])
  },
  methods: {
    ...mapActions(['notify', 'injectTokens']),
    handleCopy() {
      this.notify('Copied!');
    },
    async loadPool() {
      this.pool = await getPool(
        this.web3.network.key,
        getProvider(this.web3.network.key),
        this.id
      );
    },
    async onJoinPool(data) {
      this.tokens = this.getTokens();
      const [poolAmountOut] = data.receiveAmounts;
      const maxAmountsIn = this.pool.tokens.map((token, i) =>
        parseUnits(data.sendAmounts[i], this.tokens[token].decimals).toString()
      );
      const transferTokens = true;
      const beneficiary = this.web3.account;
      const params = [
        parseUnits(
          poolAmountOut,
          this.tokens[this.pool.tokenizer.address].decimals
        ),
        maxAmountsIn,
        transferTokens,
        beneficiary
      ];
      try {
        const tx = await joinPool(
          this.$auth.web3,
          this.pool.tokenizer.address,
          params
        );
        console.log(tx);
        await this.loadPool();
      } catch (e) {
        console.log(e);
      }
    },
    async onExitPool(data) {
      this.tokens = this.getTokens();
      const [poolAmountIn] = data.sendAmounts;
      const minAmountsOut = this.pool.tokens.map((token, i) =>
        parseUnits(
          data.receiveAmounts[i],
          this.tokens[token].decimals
        ).toString()
      );
      const withdrawTokens = true;
      const beneficiary = this.web3.account;
      const params = [
        parseUnits(
          poolAmountIn,
          this.tokens[this.pool.tokenizer.address].decimals
        ),
        minAmountsOut,
        withdrawTokens,
        beneficiary
      ];
      try {
        const tx = await exitPool(
          this.$auth.web3,
          this.pool.tokenizer.address,
          params
        );
        console.log(tx);
        await this.loadPool();
      } catch (e) {
        console.log(e);
      }
    }
  },
  async created() {
    this.loading = true;
    await this.loadPool();
    await this.injectTokens([
      ...this.pool.tokens,
      this.pool.tokenizer?.address || undefined
    ]);
    this.loading = false;
  }
};
</script>
