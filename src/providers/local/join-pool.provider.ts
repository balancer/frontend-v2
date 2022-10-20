import symbolKeys from '@/constants/symbol.keys';
import { AnyPool } from '@/services/pool/types';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  PropType,
  provide,
  ref,
} from 'vue';

const provider = props => {
  const pool = computed((): AnyPool => props.pool);
  const bptOut = ref('100');

  return {
    bptOut,
    pool,
  };
};

export type Response = ReturnType<typeof provider>;

export const JoinPoolProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.JoinPool
);

export const JoinPoolProvider = defineComponent({
  name: 'JoinPoolProvider',

  props: {
    pool: {
      type: Object as PropType<AnyPool>,
      required: true,
    },
  },

  setup(props) {
    provide(JoinPoolProviderSymbol, provider(props));
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
