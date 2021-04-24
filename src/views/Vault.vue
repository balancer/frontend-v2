<template>
  <Layout class="mt-4">
    <template v-slot:content-left>
      <div class="px-4 md:px-0">
        <Breadcrumb />
        <h1 v-text="$t('vault')" class="mb-5" />
      </div>
      <BalLoadingIcon v-if="loading" />
      <div v-if="loaded">
        <Block :title="$t('overview')">
          <div>
            {{ $t('numberOfPools') }}:
            {{ _num(_units(vault.numberOfPools, 0)) }}
          </div>
        </Block>
        <Block :title="$t('protocolFees')">
          <div>
            {{ $t('flashLoanFee') }}: {{ _units(vault.protocolFlashLoanFee) }}%
          </div>
          <div>{{ $t('swapFee') }}: {{ _units(vault.protocolSwapFee) }}%</div>
          <div>
            {{ $t('withdrawFee') }}: {{ _units(vault.protocolWithdrawFee) }}%
          </div>
        </Block>
      </div>
    </template>
  </Layout>
</template>

<script>
import getProvider from '@/utils/provider';
import { getVault } from '@/utils/balancer/vault';

export default {
  data() {
    return {
      loading: false,
      loaded: false,
      vault: {
        numberOfPools: false,
        protocolFlashLoanFee: false,
        protocolSwapFee: false,
        protocolWithdrawFee: false
      }
    };
  },
  async created() {
    this.loading = true;
    this.vault = await getVault(
      this.web3.config.key,
      getProvider(this.web3.config.key)
    );
    this.loading = false;
    this.loaded = true;
  }
};
</script>
