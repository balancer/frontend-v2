<template>
	<Layout class="mt-4">
		<template slot="content-right">
			<div class="px-4 px-md-0">
				<Breadcrumb/>
				<h1 class="mb-3">
					Portfolio
					<h2 class="float-right mt-1">
						{{
							$n(portfolioValue, '$0,0')
						}}<span v-text="$n(portfolioValue, '.[00]')" class="text-gray"/>
					</h2>
				</h1>
			</div>
			<Block :slim="true">
				<div v-if="loading" class="text-center p-4">
					<UiLoading/>
				</div>
				<div
					v-for="(token, i) in getTokens({ withBalance: true })"
					:key="i"
					class="p-3 border-bottom last-child-border-0 d-flex flex-items-center"
				>
					<Token :token="token" :size="32" class="mr-3"/>
					<div class="flex-auto">
						<div v-text="token.name" class="text-white"/>
						<div>
							{{ $n(token.balance, '0,0.[000]') }} {{ token.symbol }} ·
							{{ $n(token.price, '$0,0.[00]') }}
						</div>
					</div>
					<div class="text-right">
						<div class="text-white">
							{{ $n(token.value, '$0,0.[00]') }}
						</div>
						<div>
              <span
	              v-if="token.price24HChange"
	              :class="token.price24HChange > 0 ? 'text-green' : 'text-red'"
              >
                {{ $n(token.price24HChange, '+0,0.[00]') }}% ({{
		              $n(token.value24HChange, '$0,0.[00]')
	              }})
              </span>
						</div>
					</div>
				</div>
			</Block>
		</template>
		<template slot="sidebar-left">
			<BlockMenu/>
		</template>
	</Layout>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
	computed: {
		...mapGetters(['getTokens', 'getPortfolioValue']),
		loading() {
			return (
				this.app.authLoading ||
				(this.account.loading && !this.account.loaded) ||
				this.registry.loading
			);
		},
		portfolioValue() {
			return this.getPortfolioValue();
		}
	}
};
</script>
