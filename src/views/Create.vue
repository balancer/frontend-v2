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
          <Block title="Trading strategy">
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
	        <div v-if="form.strategyType">
		        <Block title="Swap fee">
			        <UiButton class="d-flex width-full mb-2 px-3">
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
		        </Block>
		        <Block v-if="form.strategyType === '0'" title="Tokens">
			        <UiButton
				        v-for="(token, i) in form.tokens"
				        :key="token.address"
				        class="width-full text-left mb-2 px-3"
			        >
				        <Token
					        :url="token.logoURI"
					        :address="token.address"
					        :size="24"
					        class="mr-1"
				        />
				        {{ token.symbol }}
				        <a @click="removeToken(i)" class="float-right">
					        <Icon name="close" size="12" class="mb-1" />
				        </a>
			        </UiButton>
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
		        <Block v-if="form.strategyType === '1'" title="Amp">
			        <UiButton class="d-flex width-full mb-2 px-3">
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
	        </div>
        </div>
      </div>
      <div class="col-12 col-lg-4 float-left">
        <Block title="Actions">
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
import strategies from '@/utils/balancer/strategies';
import {createCwpStrategy, createFlattenedStrategy} from '@/utils/balancer/utils/factory';

export default {
  data() {
    return {
      q: '',
	    loading: false,
      strategies: Object.values(strategies),
      form: {
        strategyType: null,
        tokens: [],
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
    ...mapGetters(['getTokens', 'getCurrentTokenlist', 'getTokenlists']),
    params() {
	    if (this.form.strategyType === '0') return [
        this.form.tokens.map(token => token.address),
	      this.form.tokens.map((token, i) => (i + 1).toString()),
        parseUnits(this.form.swapFee || '0', 16).toString()
      ];
	    if (this.form.strategyType === '1') return [
		    parseUnits(this.form.swapFee || '0', 16).toString(),
		    this.form.amp
	    ];
	    return [];
    }
  },
  methods: {
    ...mapActions(['setTokenlist', 'notify', 'watchTx']),
    addToken(token) {
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
    },
    selectTokenlist(i) {
      if (i) this.setTokenlist(i);
      this.q = '';
      this.modal.selectToken = true;
    },
    async onSubmit() {
    	this.loading = true;
    	try {
    		const createStrategies = [createCwpStrategy, createFlattenedStrategy];
		    const tx = await createStrategies[this.form.strategyType](this.$auth.web3, this.params);
		    this.loading = false;
		    console.log(tx);
		    await this.watchTx(tx);
		    this.notify('Strategy created!');
	    } catch (e) {
		    this.loading = false;
	    }
    }
  }
};
</script>
