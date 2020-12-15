<template>
  <Container :slim="true">
    <div class="px-4 px-md-0">
      <div class="mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          Home
        </router-link>
      </div>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div>
          <h1 v-text="'Create a pool'" class="mb-4" />
          <Block title="Tokenizer">
            <UiButton
              v-for="(tokenizer, i) in tokenizers"
              :key="i"
              @click="form.tokenizer = i"
              :class="form.tokenizer === i && 'button--active'"
              class="width-full mb-2"
            >
              {{ tokenizer.name }}
            </UiButton>
          </Block>
          <div v-if="form.tokenizer !== ''">
            <Block title="Strategy">
              <UiButton class="d-flex width-full px-3 mb-2">
                <span class="mr-2 text-gray">Address</span>
                <input
                  v-model="form.strategy"
                  class="input text-left flex-auto"
                  required
                />
              </UiButton>
              <UiButton class="d-flex width-full px-3">
                <span class="mr-2 text-gray">Type</span>
                <input
                  v-model="form.strategyType"
                  class="input text-left flex-auto"
                  type="number"
                  placeholder="0"
                  step="0"
                  required
                />
              </UiButton>
            </Block>
            <Block title="Initial BPT">
              <UiButton class="d-flex width-full mb-2 px-3">
                <input
                  v-model="form.initialBPT"
                  type="number"
                  placeholder="0"
                  step="0"
                  class="input text-left flex-auto"
                  required
                />
              </UiButton>
            </Block>
            <Block title="Tokens">
              <div
                v-for="(token, i) in form.tokens"
                :key="tokens[token].address"
                class="p-4 d-block border rounded-2 mb-3 position-relative"
              >
                <a
                  @click="removeToken(i)"
                  class="position-absolute top-4 right-0"
                >
                  <Icon name="close" size="12" class="p-4" />
                </a>
                <Token
                  :token="tokens[token]"
                  :symbol="true"
                  :name="true"
                  class="mb-3 text-white"
                />
                <div>
                  <UiButton class="d-flex width-full px-3">
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
            <Block v-if="form.tokenizer === 1" title="Owner">
              <UiButton class="d-flex width-full mb-2 px-3">
                <input
                  v-model="form.owner"
                  class="input text-left flex-auto"
                  required
                />
              </UiButton>
            </Block>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4 float-left">
        <Block title="Actions">
          <UiButton
            @click="onApprove"
            :disabled="!$auth.isAuthenticated"
            class="d-block width-full mb-2"
          >
            Approve
          </UiButton>
          <UiButton
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
    </div>
    <portal to="modal">
      <ModalSelectToken
        :open="modal.selectToken"
        :loading="registry.loading"
        @close="modal.selectToken = false"
        @select="addToken"
        @selectTokenlist="
          modal.selectToken = false;
          modal.selectTokenlist = true;
          q = '';
        "
        @inputSearch="q = $event"
        :tokens="getTokens({ q })"
        :tokenlist="getCurrentTokenlist"
      />
      <ModalSelectTokenlist
        :open="modal.selectTokenlist"
        @close="modal.selectTokenlist = false"
        @back="selectTokenlist"
        @select="selectTokenlist"
        @inputSearch="q = $event"
        :tokenlists="getTokenlists({ q })"
      />
    </portal>
  </Container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { parseUnits } from '@ethersproject/units';
import { id } from '@ethersproject/hash';
import tokenizers from '@/utils/balancer/tokenizers';
import {
  createFixedSetPoolTokenizer,
  createOwnableFixedSetPoolTokenizer
} from '@/utils/balancer/utils/factory';
import { approveTokens } from '@/utils/balancer/utils/tokens';
import { VAULT_ADDRESS } from '@/utils/balancer/constants';

export default {
  data() {
    return {
      q: '',
      loading: false,
      tokenizers: Object.values(tokenizers),
      form: {
        tokenizer: '',
        tokens: [],
        amounts: [],
        initialBPT: '',
        owner: ''
      },
      modal: {
        selectToken: false,
        selectTokenlist: false
      }
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist', 'getTokenlists']),
    tokens() {
      return this.getTokens();
    },
    params() {
      const params = [
        this.form.strategy,
        parseInt(this.form.strategyType),
        parseUnits(this.form.initialBPT || '0').toString(),
        this.form.tokens,
        this.form.amounts.map((amount, i) =>
          parseUnits(
            amount || '0',
            this.tokens[this.form.tokens[i]].decimals
          ).toString()
        )
      ];
      if (this.form.tokenizer === 1) params.push(this.form.owner);
      params.push(id(Math.random().toString()));
      return params;
    }
  },
  methods: {
    ...mapActions(['setTokenlist', 'notify', 'watchTx']),
    addToken(token) {
      this.form.amounts.push('');
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
      this.form.amounts = this.form.amounts.filter(
        (token, index) => index !== i
      );
    },
    selectTokenlist(i) {
      if (i) this.setTokenlist(i);
      this.q = '';
      this.modal.selectToken = true;
    },
    async onSubmit() {
      this.loading = true;
      try {
        const createTokenizers = [
          createFixedSetPoolTokenizer,
          createOwnableFixedSetPoolTokenizer
        ];
        const tx = await createTokenizers[this.form.tokenizer](
          this.$auth.web3,
          this.params
        );
        this.loading = false;
        console.log(tx);
        await this.watchTx(tx);
        this.notify('Pool created!');
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    },
    async onApprove() {
      try {
        const tx = await approveTokens(
          this.$auth.web3,
          VAULT_ADDRESS,
          this.form.tokens
        );
        console.log(tx);
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
