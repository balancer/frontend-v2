<template>
  <Container :slim="true">
    <div class="px-4 px-md-0">
      <div class="mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          Home
        </router-link>
      </div>
      <h1 v-text="'Create a pool'" class="mb-4" />
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div>
          <Block title="Tokens">
            <UiButton
              v-for="(token, i) in form.tokens"
              :key="token.address"
              class="width-full text-left mb-2 px-3"
            >
              <Token
                :url="token.logoURI"
                :address="token.address"
                :size="24"
                class="mr-1"
              />
              {{ token.symbol }}
              <a @click="removeToken(i)" class="float-right">
                <Icon name="close" size="12" class="mb-1" />
              </a>
            </UiButton>
            <UiButton
              @click="
                modal.selectToken = true;
                q = '';
              "
              class="width-full"
            >
              Add a token
            </UiButton>
          </Block>
          <Block title="Tokenizer">
            <UiButton class="width-full mb-2">
              Immutable pool
            </UiButton>
            <UiButton class="width-full">
              Ownable pool
            </UiButton>
          </Block>
          <Block title="Trading strategy">
            <UiButton class="width-full mb-2">
              Constant weighted product
            </UiButton>
            <UiButton class="width-full">
              Flattened curve
            </UiButton>
          </Block>
        </div>
      </div>
    </div>
    <portal to="modal">
      <ModalSelectToken
        :open="modal.selectToken"
        :loading="registry.loading"
        @close="modal.selectToken = false"
        @select="addToken"
        @selectTokenlist="
          modal.selectToken = false;
          modal.selectTokenlist = true;
          q = '';
        "
        @inputSearch="q = $event"
        :tokens="getTokens({ q })"
        :tokenlist="getCurrentTokenlist"
      />
      <ModalSelectTokenlist
        :open="modal.selectTokenlist"
        @close="modal.selectTokenlist = false"
        @back="selectTokenlist"
        @select="selectTokenlist"
        @inputSearch="q = $event"
        :tokenlists="getTokenlists({ q })"
      />
    </portal>
  </Container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      q: '',
      form: {
        tokens: []
      },
      modal: {
        selectToken: false,
        selectTokenlist: false
      }
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist', 'getTokenlists'])
  },
  methods: {
    ...mapActions(['setTokenlist']),
    addToken(token) {
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
    },
    selectTokenlist(i) {
      if (i) this.setTokenlist(i);
      this.q = '';
      this.modal.selectToken = true;
    }
  }
};
</script>
