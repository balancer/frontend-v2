<template>
	<Layout class="mt-4">
		<template slot="content-right">
			<div class="px-4 px-md-0">
				<Breadcrumb/>
				<h1 class="mb-3">Portfolio</h1>
			</div>
			<Block :slim="true">
				<div v-if="app.authLoading || registry.loading" class="text-center p-4">
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
							{{ _numeral(token.balance, '(0,0.[000])') }} {{ token.symbol }} ·
							{{ _numeral(token.price, '$(0,0.[00])') }}
						</div>
					</div>
					<div class="text-right">
						<div class="text-white">
							{{ _numeral(token.value, '$(0,0.[00])') }}
						</div>
						<div>
              <span
	              v-if="token.price24HChange"
	              :class="token.price24HChange > 0 ? 'text-green' : 'text-red'"
              >
                <span v-if="token.price24HChange > 0" v-text="'+'"/>{{
		              _numeral(token.price24HChange)
	              }}%
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
		...mapGetters(['getTokens'])
	}
};
</script>
