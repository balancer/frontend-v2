<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 v-text="'Vault'" class="mb-4" />
      </div>
      <UiLoading v-if="loading" />
      <div v-if="loaded">
        <Block title="Overview">
          <div>{{ $t('numberOfPools') }}: {{ vault.numberOfPools }}</div>
        </Block>
        <Block title="Protocol fees">
          <div>{{ $t('flashLoanFee') }}: {{ vault.protocolFlashLoanFee }}</div>
          <div>{{ $t('swapFee') }}: {{ vault.protocolSwapFee }}</div>
          <div>{{ $t('withdrawFee') }}: {{ vault.protocolWithdrawFee }}</div>
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
