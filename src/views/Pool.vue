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
          <div v-if="pool">
            <Block title="Controller">
              <User :address="pool.controller" />
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
      <div class="col-12 col-lg-4 float-left">
        <BlockPoolJoin
          v-if="pool"
          :sendTokens="getTokens({ addresses: pool.tokens })"
        />
      </div>
    </div>
  </Container>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { mapActions, mapGetters } from 'vuex';
import { getPool } from '@/utils/balancer/utils/pools';

export default {
  data() {
    return {
      id: this.$route.params.id,
      pool: false
    };
  },
  computed: {
    ...mapGetters(['getTokens'])
  },
  methods: {
    ...mapActions(['notify']),
    handleCopy() {
      this.notify('Copied!');
    }
  },
  async created() {
    const network = this.web3.network.key;
    const pool = await getPool(network, getProvider(network), this.id);
    console.log(pool);
    this.pool = pool;
  }
};
</script>
