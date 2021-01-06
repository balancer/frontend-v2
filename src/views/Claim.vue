<template>
  <Container class="overflow-hidden">
    <div class="px-4 px-md-0">
      <div class="mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          Home
        </router-link>
      </div>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <h1 v-text="'Claim BAL'" class="mb-4" />
      </div>
    </div>
    <div class="col-12 col-lg-4 float-left">
      <Block title="Actions">
        <UiButton :loading="loading" class="d-block width-full mb-2">
          {{ _numeral(totalPending) }} BAL
        </UiButton>
        <UiButton
          :disabled="loading || !$auth.isAuthenticated"
          @click="onSubmit"
          class="d-block width-full button--submit"
        >
          Claim
        </UiButton>
      </Block>
    </div>
  </Container>
</template>

<script>
import { mapActions } from 'vuex';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
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
