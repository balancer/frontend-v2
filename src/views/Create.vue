<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 v-text="'Create a pool'" class="mb-4" />
      </div>
      <Block title="Pool type">
        <UiButton
          v-for="(strategy, i) in strategies"
          :key="i"
          @click="form.strategyType = strategy.type"
          :class="form.strategyType === strategy.type && 'button--active'"
          class="width-full mb-2"
        >
          {{ strategy.name }}
        </UiButton>
      </Block>
      <Block v-if="form.strategyType" title="Configuration">
        <UiButton class="d-flex width-full px-3 mb-2">
          <span class="mr-2 text-gray">Initial BPT</span>
          <input
            v-model="form.initialBPT"
            type="number"
            placeholder="0"
            step="0"
            class="input text-left flex-auto"
            required
          />
        </UiButton>

        <UiButton class="d-flex width-full mb-2 px-3">
          <span class="mr-2 text-gray">Swap fee</span>
          <input
            v-model="form.swapFee"
            class="input text-left flex-auto"
            type="number"
            placeholder="0.0"
            step="16"
            required
          />
          %
        </UiButton>
        <UiButton
          v-if="form.strategyType === '1'"
          class="d-flex width-full mb-2 px-3"
        >
          <span class="mr-2 text-gray">Amplification</span>
          <input
            v-model="form.amp"
            class="input text-left flex-auto"
            type="number"
            placeholder="0"
            step="0"
            required
          />
        </UiButton>
      </Block>
      <Block v-if="form.strategyType" title="Tokens">
        <div
          v-for="(token, i) in form.tokens"
          :key="tokens[token].address"
          class="p-4 d-block border rounded-2 mb-3 position-relative"
        >
          <a @click="removeToken(i)" class="position-absolute top-4 right-0">
            <Icon name="close" size="12" class="p-4" />
          </a>
          <Token
            :token="tokens[token]"
            :symbol="true"
            :name="true"
            class="mb-3 text-white"
          />
          <div>
            <UiButton
              v-if="form.strategyType === '0'"
              class="d-flex width-full px-3 mb-2"
            >
              <span class="mr-2 text-gray">Weight</span>
              <input
                v-model="form.weights[i]"
                class="input width-full"
                type="number"
                placeholder="0.0"
                step="any"
                required
              />
            </UiButton>
            <UiButton
              :class="{
                'border-red':
                  parseFloat(form.amounts[i]) > tokens[token].balance
              }"
              class="d-flex width-full px-3"
            >
              <span class="mr-2 text-gray">Amount</span>
              <input
                v-model="form.amounts[i]"
                class="input width-full"
                type="number"
                placeholder="0.0"
                step="any"
                required
              />
            </UiButton>
          </div>
        </div>
        <UiButton
          @click="
            modal.selectToken = true;
            q = '';
          "
          class="width-full"
        >
          Add a token
        </UiButton>
      </Block>
    </template>
    <template slot="sidebar-right">
      <div v-if="form.strategyType">
        <Block title="Actions">
          <UiButton
            v-if="!hasAllowed && Object.keys(requiredAllowances).length > 0"
            @click="onApprove"
            :disabled="!$auth.isAuthenticated"
            class="d-block width-full mb-2"
          >
            Approve
          </UiButton>
          <UiButton
            v-else
            @click="onSubmit"
            :disabled="!$auth.isAuthenticated"
            :loading="loading"
            class="d-block width-full button--submit"
          >
            Create
          </UiButton>
        </Block>
        <Block title="Payload">
          "create"
          <pre>{{ JSON.stringify(params, null, 2) }}</pre>
        </Block>
      </div>
    </template>
    <portal to="modal">
      <ModalSelectToken
        :open="modal.selectToken"
        :loading="registry.loading"
        @close="modal.selectToken = false"
        @select="addToken"
        @selectTokenlist="modalSelectLists"
        @inputSearch="onTokenSearch"
        :tokens="getTokens({ q, not: form.tokens })"
        :tokenlist="getCurrentTokenlist"
      />
      <ModalSelectTokenlist
        :open="modal.selectTokenlist"
        @close="modal.selectTokenlist = false"
        @back="modalSelectToken"
        @select="toggleList($event)"
        @inputSearch="q = $event"
        :tokenlists="getTokenlists({ q })"
        :activeLists="registry.activeLists"
      />
    </portal>
  </Layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { parseUnits } from '@ethersproject/units';
import constants from '@/utils/balancer/constants';
import {
  createConstantProductPool,
  createStablecoinPool
} from '@/utils/balancer/utils/factory';
import { approveTokens } from '@/utils/balancer/utils/tokens';
import { id } from '@ethersproject/hash';

export default {
  data() {
    return {
      q: '',
      loading: false,
      strategies: Object.values(constants.strategies),
      hasAllowed: false,
      form: {
        strategyType: null,
        initialBPT: '',
        tokens: [],
        weights: [],
        amounts: [],
        swapFee: '',
        amp: ''
      },
      modal: {
        selectToken: false,
        selectTokenlist: false
      }
    };
  },
  computed: {
    ...mapGetters([
      'getTokens',
      'getCurrentTokenlist',
      'getTokenlists',
      'getRequiredAllowances'
    ]),
    tokens() {
      return this.getTokens();
    },
    requiredAllowances() {
      return this.getRequiredAllowances({
        tokens: Object.fromEntries(
          this.params[1].map((token, i) => [token, this.params[2][i] || '0'])
        )
      });
    },
    params() {
      const initialBPT = parseUnits(this.form.initialBPT || '0').toString();
      const tokens = this.form.tokens;
      const amounts = this.form.tokens.map((token, i) =>
        parseUnits(
          this.form.amounts[i] || '0',
          this.tokens[this.form.tokens[i]].decimals
        ).toString()
      );
      const swapFee = parseUnits(this.form.swapFee || '0', 16).toString();
      const salt = id(Math.random().toString());
      const params = [initialBPT, tokens, amounts];
      if (this.form.strategyType === '0')
        params.push(
          this.form.weights.map(weight =>
            parseUnits(weight || '0', 16).toString()
          )
        );
      if (this.form.strategyType === '1') params.push(this.form.amp);
      params.push(swapFee);
      params.push(salt);
      return params;
    }
  },
  methods: {
    ...mapActions([
      'setTokenlist',
      'notify',
      'watchTx',
      'getAllowances',
      'injectTokens',
      'toggleList'
    ]),
    modalSelectToken() {
      this.modal.selectToken = true;
      this.modal.selectTokenlist = false;
      this.q = '';
    },
    modalSelectLists() {
      this.modal.selectToken = false;
      this.modal.selectTokenlist = true;
      this.q = '';
    },
    addToken(token) {
      this.form.weights.push('');
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
      this.form.weights = this.form.weights.filter(
        (token, index) => index !== i
      );
    },
    selectTokenlist(i) {
      if (i) this.setTokenlist(i);
      this.q = '';
      this.modal.selectToken = true;
    },
    onTokenSearch(event) {
      this.q = event;
      this.injectTokens([event.trim()]);
    },
    async onSubmit() {
      this.loading = true;
      try {
        const createStrategies = [
          createConstantProductPool,
          createStablecoinPool
        ];
        const tx = await createStrategies[this.form.strategyType](
          this.$auth.web3,
          this.params
        );
        this.loading = false;
        console.log('Tx', tx);
        await this.watchTx(tx);
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        this.notify('Pool created!');
        const poolId = receipt.events?.[0]?.topics?.[2];
        console.log('Pool id', poolId);
      } catch (e) {
        this.loading = false;
      }
    },
    async onApprove() {
      try {
        const tx = await approveTokens(
          this.$auth.web3,
          constants.vault,
          Object.keys(this.requiredAllowances)
        );
        console.log(tx);
        this.hasAllowed = true;
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
