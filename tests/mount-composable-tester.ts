import { App, ComponentPublicInstance, createApp, h } from 'vue';

export interface MountResult<R> {
  result: R;
  vm: ComponentPublicInstance;
  unmount: () => void;
}

export interface MountOptions {
  provider?: () => void;
  intermediateProvider?: () => void;
  configApp?: (app: App) => void;
}

export function mount<R>(
  composable: () => R,
  options?: MountOptions
): MountResult<R> {
  const App = {
    setup() {
      options?.provider?.();
    },

    render() {
      return h(Child, {
        ref: 'child',
      });
    },
  };

  const Child = {
    setup() {
      // Useful when some provider depends itself on another provider that should be provided from an upper level (App-> Child -> GrandChild)
      // For instance, joinPoolProvider depends on useTokens (App provides tokens -> Child provides joinPool -> GrandChild uses composable that injects joinPool)
      options?.intermediateProvider?.();
    },

    render() {
      return h(GrandChild, {
        ref: 'grandchild',
      });
    },
  };

  const GrandChild = {
    setup() {
      const result = composable();
      const wrapper = () => result;
      return { wrapper };
    },

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    render() {},
  };

  const root = document.createElement('div');
  const app = createApp(App);
  options?.configApp?.(app);
  const vm = app.mount(root);

  return {
    //@ts-ignore
    result: vm.$refs.child.$refs.grandchild.wrapper(),
    vm,

    unmount: () => app.unmount(),
  };
}
