<template>
  <Container :slim="true">
    <div class="px-4 px-md-0">
      <h1 v-text="'Explore'" class="mb-4" />
    </div>
    <div class="mr-n3">
      <div v-for="poolId in poolIds" :key="poolId" class="col-3 float-left">
        <router-link
          :to="{ name: 'pool', params: { id: poolId } }"
          class="d-block overflow-hidden mr-3"
        >
          <Block>
            {{ _shorten(poolId) }}
          </Block>
        </router-link>
      </div>
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
      poolIds: []
    };
  },
  methods: {
    async onClick() {
      console.log('Click');
    }
  },
  async created() {
    const totalPools = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'getTotalPools']
    );
    this.poolIds = await call(
      getProvider(this.web3.network.key),
      abi['Vault'],
      [VAULT_ADDRESS, 'getPoolIds', [0, totalPools]]
    );
  }
};
</script>
