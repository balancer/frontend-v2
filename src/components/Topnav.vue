<template>
	<Sticky :key="web3.network.unknown">
		<nav id="topnav" class="border-bottom width-full block-bg">
			<div
				v-if="web3.network.unknown"
				class="p-2 text-center bg-red"
				style="color: white;"
			>
				<Icon name="warning1" size="20" class="mr-1 v-align-text-bottom"/>
				Balancer is not available in your current network
			</div>
			<Container>
				<div class="d-flex flex-items-center" style="height: 78px;">
					<div class="flex-auto d-flex flex-items-center">
						<router-link
							:to="{ name: 'home' }"
							class="d-flex flex-items-center pr-2"
						>
							<img
								v-if="app.skin === 'light'"
								src="~@/assets/logo-light.svg"
								height="30"
								class="mr-2"
							/>
							<img
								v-else
								src="~@/assets/logo-dark.svg"
								height="30"
								class="mr-2"
							/>
							<span
								class="mr-1"
								style="font-size: 24px; margin-top: 4px;"
								v-text="'balancer'"
							/>
						</router-link>
					</div>
					<div :key="web3.account">
						<template v-if="$auth.isAuthenticated">
							<router-link
								:to="{ name: 'claim', params: { address: web3.account } }"
							>
								<UiButton
									v-if="totalPending"
									class="button--submit hide-sm hide-md mr-2"
								>
									✨ {{ $n(totalPending) }} BAL
								</UiButton>
							</router-link>
							<UiButton
								@click="modalOpen = true"
								class="button-outline"
								:loading="app.authLoading"
							>
								<Avatar
									:address="web3.account"
									:profile="web3.profile"
									size="16"
									class="mr-0 mr-sm-2 mr-md-2 mr-lg-2 mr-xl-2 ml-n1 mr-n1"
								/>
								<span
									v-if="web3.profile.name || web3.profile.ens"
									v-text="web3.profile.name || web3.profile.ens"
									class="hide-sm"
								/>
								<span v-else v-text="_shorten(web3.account)" class="hide-sm"/>
							</UiButton>
						</template>
						<UiButton v-if="!$auth.isAuthenticated" @click="modalOpen = true">
							<span class="hide-sm" v-text="'Connect wallet'"/>
							<Icon
								name="login"
								size="20"
								class="hide-md hide-lg hide-xl ml-n2 mr-n2 v-align-text-bottom"
							/>
						</UiButton>
						<router-link :to="{ name: 'settings' }" class="ml-2">
							<UiButton class="px-2">
								<Icon name="gear" size="22" class="v-align-text-bottom px-1"/>
							</UiButton>
						</router-link>
					</div>
				</div>
			</Container>
			<div
				v-if="notifications.watch.length > 0"
				class="p-2 text-center bg-blue"
				style="color: white;"
			>
				<UiLoading class="fill-white mr-2"/>
				<span class="d-inline-block pt-1"
				>{{ $n(notifications.watch.length) }} transaction pending</span
				>
			</div>
		</nav>
		<portal to="modal">
			<ModalAccount
				:open="modalOpen"
				@close="modalOpen = false"
				@login="handleLogin"
			/>
		</portal>
	</Sticky>
</template>

<script>
import { mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import { getPendingClaims } from '@/utils/balancer/claim';

export default {
  data() {
    return {
      modalOpen: false,
      pendingClaims: false,
      totalPending: false
    };
  },
  watch: {
    'web3.account': function() {
      this.pendingClaims = false;
      this.totalPending = false;
      if (this.web3.account) this.getPendingClaims();
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin(connector) {
      this.modalOpen = false;
      await this.login(connector);
    },
    async getPendingClaims() {
	    const network = '1' || this.web3.network.key;
	    const provider = getProvider(network);
	    const pendingClaims = await getPendingClaims(
		    network,
		    provider,
		    this.web3.account
	    );
	    this.pendingClaims = pendingClaims;
	    this.totalPending = pendingClaims
		    .map(claim => parseFloat(claim.amount))
		    .reduce((a, b) => a + b, 0);
    }
  }
};
</script>

<style scoped lang="scss">
#topnav {
	box-shadow: 0 0 12px -6px var(--border-color);
}
</style>
