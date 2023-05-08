import { defineComponent } from 'vue';

export function createProviderComponent(provider: () => any) {
  return defineComponent({
    setup() {
      provider();
    },
    render() {
      return this.$slots?.default ? this.$slots.default() : [];
    },
  });
}
