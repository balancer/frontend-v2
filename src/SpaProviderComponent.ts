import { defineComponent } from 'vue';

export function createProviderComponent(provideCb: () => any) {
  return defineComponent({
    setup() {
      //SSR friendly
      provideCb();
      // onMounted(() => provideCb());
    },
    render() {
      return this.$slots?.default ? this.$slots.default() : [];
    },
  });
}
