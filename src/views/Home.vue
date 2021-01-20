<template>
  <Container :slim="true" class="overflow-hidden">
    <div>
      <div class="col-12 col-lg-3 float-left hide-sm hide-md hide-lg">
	      <Block title="Menu">
		      <p class="d-flex flex-column">
			      <router-link :to="{ name: 'create' }">
				      Create pool
			      </router-link>
			      <router-link :to="{ name: 'vault' }">
				      Vault
			      </router-link>
		      </p>
	      </Block>
	      <Block title="Filters">
		      <UiButton @click="modal.selectToken = true" class="mb-3 width-full">
			      Token(s)
		      </UiButton>
		      <div v-if="!registry.loading">
			      <div v-for="(token, i) in form.tokens" :key="i" class="d-flex py-1">
				      <Token
					      :token="tokens[token]"
					      :symbol="true"
					      class="text-white flex-auto"
				      />
				      <a @click="removeToken(i)"
				      >
					      <Icon name="close" size="16" class="py-1 text-gray"
					      />
				      </a>
			      </div>
		      </div>
	      </Block>
      </div>
	    <div class="col-12 col-lg-9 float-left pl-0 pl-lg-5">
		    <div class="px-4 px-md-0 d-flex">
			    <div class="flex-auto">
				    <div class="d-flex flex-items-center flex-auto">
					    <h1 class="mb-3">Explore</h1>
				    </div>
				    <Block
					    :slim="true"
					    v-infinite-scroll="loadMore"
					    infinite-scroll-distance="0"
					    infinite-scroll-disabled="loading"
					    class="overflow-hidden"
				    >
					    <div v-if="loading || registry.loading" class="text-center p-4">
						    <UiLoading/>
					    </div>
					    <div v-if="!registry.loading">
						    <p
							    v-if="!loading && Object.keys(filteredPools).length === 0"
							    class="px-4 pt-4 pb-3"
						    >
							    There aren't any matches for your search.
						    </p>
						    <div
							    v-else
							    v-for="pool in filteredPools"
							    :key="pool.id"
							    class="overflow-hidden border-bottom last-child-border-0"
						    >
							    <router-link
								    :to="{ name: 'pool', params: { id: pool.id } }"
								    class="d-block overflow-hidden"
							    >
								    <BlockPool :pool="pool" :tokens="tokens"/>
							    </router-link>
						    </div>
					    </div>
				    </Block>
          </div>
        </div>
      </div>
    </div>
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
  </Container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import Vault from '@/utils/balancer/vault';
import { getPools } from '@/utils/balancer/utils/pools';
import { clone } from '@/utils';

export default {
  data() {
    return {
      q: '',
      loading: false,
      pools: {},
      limit: 64,
      form: {
        tokens: []
      },
      modal: {
        selectToken: false,
        selectTokenlist: false
      }
    };
  },
  watch: {
    'web3.network.key': function() {
      this.pools = {};
      this.loadPools();
    },
    'form.tokens': function() {
      const query = clone(this.form);
      this.$router.push({ query });
    }
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist', 'getTokenlists']),
    tokens() {
      return this.getTokens();
    },
    filteredPools() {
      return Object.fromEntries(
        Object.entries(this.pools)
          .filter(pool =>
            this.form.tokens.every(token => pool[1].tokens.includes(token))
          )
          .slice(0, this.limit)
      );
    }
  },
  methods: {
	  ...mapActions(['injectTokens', 'setTokenlist', 'toggleList']),
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
		  this.form.tokens.push(token);
	  },
	  removeToken(i) {
		  this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
	  },
	  onTokenSearch(event) {
		  this.q = event;
		  this.injectTokens([event.trim()]);
	  },
	  loadMore() {
		  this.limit += 8;
	  },
	  async loadPools() {
		  const query = clone(this.$route.query);
		  if (query.tokens && !Array.isArray(query.tokens))
			  query.tokens = [query.tokens];
		  this.form = {...this.form, ...query};
		  this.loading = true;
		  const vault = new Vault(
			  this.web3.network.key,
			  getProvider(this.web3.network.key)
		  );
		  const totalPools = await vault.getTotalPools();
		  console.log('Total pools', totalPools);
		  const poolIds = await vault.getPoolIds(0, totalPools);
		  console.log('Pool ids', poolIds);
		  const pools = await getPools(
			  this.web3.network.key,
			  getProvider(this.web3.network.key),
			  poolIds.slice(0)
		  );
		  const tokens = [];
		  Object.values(pools).forEach(pool =>
			  pool.tokens.forEach(token => tokens.push(token))
      );
      await this.injectTokens(tokens);
      this.pools = pools;
      console.log('Multicall', this.pools);
      this.loading = false;
    }
  },
  async created() {
    await this.loadPools();
  }
};
</script>
