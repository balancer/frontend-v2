import { defineComponent } from 'vue';

export function createProviderComponent(provideCb: () => any) {
  return defineComponent({
    setup() {
      provideCb();
    },
    render() {
      return this.$slots?.default ? this.$slots.default() : [];
    },
  });
}
