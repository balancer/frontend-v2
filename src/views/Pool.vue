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
            </Block>
            <Block title="Tokens" :counter="pool.tokens.length" :slim="true">
              <div
                v-for="(token, i) in pool.tokens"
                :key="token"
                class="px-4 py-3 d-flex border-bottom last-child-border-0"
              >
                <div class="flex-auto">
                  <User :address="token" />
                </div>
                <div>
                  {{ _numeral(pool.tokenBalances[i]) }}
                </div>
              </div>
            </Block>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4 float-left">
        <Block v-if="pool" title="Buy">
          <div class="mb-2">
            <div>Send</div>
            <UiButton
              v-for="token in pool.tokens"
              :key="token"
              class="mb-2 width-full px-3"
            >
              <input
                class="input width-full"
                type="number"
                placeholder="0.0"
                required
              />
            </UiButton>
          </div>
          <div class="mb-2">
            <div>Receive</div>
            <UiButton class="mb-2 width-full px-3">
              <input
                class="input width-full"
                type="number"
                placeholder="0.0"
                required
              />
            </UiButton>
          </div>
          <UiButton disabled class="button--submit width-full">
            Buy
          </UiButton>
        </Block>
      </div>
    </div>
  </Container>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Pool from '@/utils/balancer/pool';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      id: this.$route.params.id,
      pool: false
    };
  },
  async created() {
    const network = this.web3.network.key;
    const pool = new Pool(network, getProvider(network), this.id);
    await pool.load();
    this.pool = pool;
  },
  methods: {
    ...mapActions(['notify']),
    handleCopy() {
      this.notify('Copied!');
    }
  }
};
</script>
