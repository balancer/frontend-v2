<template>
  <Container :slim="true">
    <div class="px-4 px-md-0 mb-3">
      <router-link :to="{ name: 'home' }" class="text-gray">
        <Icon name="back" size="22" class="v-align-middle" />
        Home
      </router-link>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div class="px-4 px-md-0">
          <h1 v-text="'Create a pool'" class="mb-4" />
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
          <Block title="Tokens">
            <UiButton
              v-for="(token, i) in form.tokens"
              :key="i"
              class="width-full text-left mb-2"
            >
              <img
                :src="token.logoURI"
                class="circle v-align-middle mr-1"
                width="24"
                height="24"
              />
              {{ token.symbol }}
              <a @click="removeToken(i)" class="float-right">
                <Icon name="close" size="12" class="mb-1" />
              </a>
            </UiButton>
            <UiButton @click="modalOpen = true" class="width-full">
              Add a token
            </UiButton>
          </Block>
        </div>
      </div>
    </div>
    <portal to="modal">
      <ModalSelectToken
        :open="modalOpen"
        @close="modalOpen = false"
        @select="addToken"
        :tokens="getTokens"
        :tokenlist="getCurrentTokenlist"
        :balances="app.balances"
      />
    </portal>
  </Container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      form: {
        tokens: []
      },
      modalOpen: false
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist'])
  },
  methods: {
    addToken(token) {
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
    }
  }
};
</script>
