<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3
        v-if="!web3.account || step === 'connect'"
        v-text="$t('connectWallet')"
      />
      <h3 v-else v-text="$t('account')" />
    </template>
    <div v-if="!web3.account || step === 'connect'">
      <h3 class="m-4 mb-0 text-center"></h3>
      <div class="m-4 mb-5">
        <a
          v-for="(connector, id, i) in connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton
            v-if="id !== 'injected'"
            class="button-outline width-full v-align-middle"
          >
            <img
              :src="`${path}/${connector.id}.png`"
              height="28"
              width="28"
              class="mr-1 v-align-middle"
            />
            {{ connector.name }}
          </UiButton>
          <UiButton
            v-else-if="injected"
            class="button-outline width-full v-align-middle"
          >
            <img
              :src="`${path}/${injected.id}.png`"
              height="28"
              width="28"
              class="mr-1 v-align-middle"
            />
            {{ injected.name }}
          </UiButton>
        </a>
        <UiButton
          @click="connectorsLimit = 1e3"
          v-if="invisibleConnectorsCount"
          class="width-full"
        >
          {{ $t('seeMore') }} ({{ invisibleConnectorsCount }})
        </UiButton>
      </div>
    </div>
    <div v-else>
      <div v-if="$auth.isAuthenticated" class="m-4">
        <a
          :href="_explorer(web3.network.key, web3.account)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full">
            <Avatar :address="web3.account" size="16" class="mr-2 ml-n1" />
            <span v-if="web3.name" v-text="web3.name" />
            <span v-else v-text="_shorten(web3.account)" />
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <UiButton
          @click="step = 'connect'"
          class="button-outline width-full mb-2"
        >
          {{ $t('connectWallet') }}
        </UiButton>
        <UiButton
          @click="handleLogout"
          class="button-outline width-full text-red mb-2"
        >
          {{ $t('logOut') }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import { getInjected } from '@snapshot-labs/lock/src/utils';
import connectors from '@/constants/connectors.json';

export default {
  props: ['open'],
  data() {
    return {
      connectorsLimit: 3,
      step: null,
      path:
        'https://raw.githubusercontent.com/snapshot-labs/lock/master/connectors/assets'
    };
  },
  watch: {
    open() {
      this.step = null;
      this.connectorsLimit = 3;
    }
  },
  computed: {
    injected() {
      return getInjected();
    },
    connectors() {
      return Object.fromEntries(
        Object.entries(connectors).slice(0, this.connectorsLimit)
      );
    },
    invisibleConnectorsCount() {
      return (
        Object.keys(connectors).length - Object.keys(this.connectors).length
      );
    }
  },
  methods: {
    ...mapActions(['logout']),
    async handleLogout() {
      await this.logout();
      this.$emit('close');
    }
  }
};
</script>
