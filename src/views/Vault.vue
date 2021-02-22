<template>
  <Layout class="mt-4">
    <template v-slot:content-left>
      <div class="px-4 md:px-0">
        <Breadcrumb />
        <h1 v-text="'Vault'" class="mb-5" />
      </div>
      <UiLoading v-if="loading" />
      <div v-if="loaded">
        <Block title="Overview">
          <div>
            {{ $t('numberOfPools') }}:
            {{ _num(_units(vault.numberOfPools, 0)) }}
          </div>
        </Block>
        <Block title="Protocol fees">
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
      this.web3.network.key,
      getProvider(this.web3.network.key)
    );
    this.loading = false;
    this.loaded = true;
  }
};
</script>
