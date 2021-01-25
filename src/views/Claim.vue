<template>
	<Layout class="mt-4">
		<template slot="content-left">
			<div class="px-4 px-md-0">
				<Breadcrumb/>
				<h1 class="mb-3">Claim BAL for {{ _shorten(address) }}</h1>
			</div>
			<Block :slim="true" title="Pending claims">
				<div v-if="loading" class="text-center py-3">
					<UiLoading/>
				</div>
				<div
					v-for="(pendingClaim, i) in pendingClaims"
					:key="i"
					class="d-flex border-bottom last-child-border-0 px-4 py-3"
				>
					<div class="flex-auto">
						<a
							:href="
                `https://github.com/balancer-labs/bal-mining-scripts/blob/master/reports/${parseInt(
                  pendingClaim.id
                ) + 20}/_totals.json`
              "
							target="_blank"
						>
							Week {{ parseInt(pendingClaim.id) + 20 }}
							<Icon name="external-link" class="ml-1"/>
						</a>
					</div>
					<div>{{ $n(pendingClaim.amount) }} BAL</div>
				</div>
			</Block>
		</template>
		<template slot="sidebar-right">
			<Block title="Actions">
				<UiButton :loading="loading" class="d-block width-full mb-2">
					{{ $n(totalPending) }} BAL
				</UiButton>
				<UiButton
					:disabled="loading || !$auth.isAuthenticated"
					@click="onSubmit"
					class="d-block width-full button--submit"
				>
					Claim
				</UiButton>
			</Block>
		</template>
	</Layout>
</template>

<script>
import { mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import { claimWeeks, getPendingClaims } from '@/utils/balancer/claim';

export default {
  data() {
    return {
      address: this.$route.params.address,
      loading: false,
      loaded: false,
      pendingClaims: [],
      totalPending: 0
    };
  },
  async created() {
    this.loading = true;
    const network = '1' || this.web3.network.key;
    const provider = getProvider(network);
    const pendingClaims = await getPendingClaims(
      network,
      provider,
      this.address
    );
    this.pendingClaims = pendingClaims;
    this.totalPending = pendingClaims
      .map(claim => parseFloat(claim.amount))
      .reduce((a, b) => a + b, 0);
    this.loading = false;
    this.loaded = true;
  },
  methods: {
    ...mapActions(['notify', 'watchTx']),
    async onSubmit() {
      try {
        const network = this.web3.network.key;
        const tx = await claimWeeks(
          network,
          this.$auth.web3,
          this.web3.account,
          this.pendingClaims
        );
        this.loading = false;
        console.log('Tx', tx);
        await this.watchTx(tx);
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        this.notify('Claim success!');
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
