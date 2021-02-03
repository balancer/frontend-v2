<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 v-text="$t('vault')" class="mb-4" />
      </div>
      <Block :slim="true" :title="$t('universalAgentManagers')">
        <div
          v-for="(operatorReporter, i) in trustedOperatorReporters"
          :key="i"
          class="px-4 py-3 border-bottom last-child-border-0"
        >
          {{ operatorReporter }}
        </div>
      </Block>
      <Block :slim="true" :title="$t('universalAgents')">
        <div
          v-for="(operator, i) in trustedOperators"
          :key="i"
          class="px-4 py-3 border-bottom last-child-border-0"
        >
          {{ operator }}
        </div>
        <div
          v-if="trustedOperators.length === 0"
          v-text="$t('errorNoUniversalAgents')"
          class="px-4 py-3 border-bottom last-child-border-0"
        />
      </Block>
      <Block :title="$t('protocolFees')">
        <div>{{ $t('flashLoanFee') }}: {{ protocolFlashLoanFee }}</div>
        <div>{{ $t('swapFee') }}: {{ protocolSwapFee }}</div>
        <div>{{ $t('withdrawalFee') }}: {{ protocolWithdrawFee }}</div>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@/utils/provider';
import { abi } from '@/utils/balancer/abi/Vault.json';
import constants from '@/utils/balancer/constants';

export default {
  data() {
    return {
      trustedOperatorReporters: false,
      trustedOperators: false,
      protocolFlashLoanFee: false,
      protocolSwapFee: false,
      protocolWithdrawFee: false
    };
  },
  async created() {
    let total = await call(getProvider(this.web3.network.key), abi, [
      constants.vault,
      'getTotalTrustedOperatorReporters'
    ]);
    this.trustedOperatorReporters = await call(
      getProvider(this.web3.network.key),
      abi,
      [constants.vault, 'getTrustedOperatorReporters', [0, total]]
    );

    total = await call(getProvider(this.web3.network.key), abi, [
      constants.vault,
      'getTotalTrustedOperators'
    ]);
    this.trustedOperators = await call(
      getProvider(this.web3.network.key),
      abi,
      [constants.vault, 'getTrustedOperators', [0, total]]
    );

    this.protocolFlashLoanFee = await call(
      getProvider(this.web3.network.key),
      abi,
      [constants.vault, 'protocolFlashLoanFee']
    );

    this.protocolSwapFee = await call(getProvider(this.web3.network.key), abi, [
      constants.vault,
      'protocolSwapFee'
    ]);

    this.protocolWithdrawFee = await call(
      getProvider(this.web3.network.key),
      abi,
      [constants.vault, 'protocolWithdrawFee']
    );
  }
};
</script>
