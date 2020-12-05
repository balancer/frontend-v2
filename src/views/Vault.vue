<template>
  <Container :slim="true">
    <div class="px-4 px-md-0">
      <h1 v-text="'Vault'" class="mb-4" />
    </div>
    <div>
      <Block :slim="true" title="Trusted operator reporters">
        <div
          v-for="(operatorReporter, i) in trustedOperatorReporters"
          :key="i"
          class="px-4 py-3 border-bottom last-child-border-0"
        >
          {{ operatorReporter }}
        </div>
      </Block>
      <Block :slim="true" title="Trusted operators">
        <div
          v-for="(operator, i) in trustedOperators"
          :key="i"
          class="px-4 py-3 border-bottom last-child-border-0"
        >
          {{ operator }}
        </div>
      </Block>
      <Block>
        <div>Flash loan fee: {{ protocolFlashLoanFee }}</div>
        <div>Swap fee: {{ protocolSwapFee }}</div>
        <div>Withdraw fee: {{ protocolWithdrawFee }}</div>
      </Block>
    </div>
  </Container>
</template>

<script>
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import abi from '@/helpers/abi';
import { VAULT_ADDRESS } from '@/utils/balancer/constants';

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
    let total = await call(getProvider(this.web3.network.key), abi['Vault'], [
      VAULT_ADDRESS,
      'getTotalTrustedOperatorReporters'
    ]);
    this.trustedOperatorReporters = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'getTrustedOperatorReporters', [0, total]]
    );

    total = await call(getProvider(this.web3.network.key), abi['Vault'], [
      VAULT_ADDRESS,
      'getTotalTrustedOperators'
    ]);
    this.trustedOperators = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'getTrustedOperators', [0, total]]
    );

    this.protocolFlashLoanFee = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'protocolFlashLoanFee']
    );

    this.protocolSwapFee = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'protocolSwapFee']
    );

    this.protocolWithdrawFee = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'protocolWithdrawFee']
    );
  }
};
</script>
