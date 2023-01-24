import { App, ComponentPublicInstance, createApp, h } from 'vue';

export interface MountResult<R> {
  result: R;
  vm: ComponentPublicInstance;
  unmount: () => void;
}

export interface MountOptions {
  provider?: () => void;
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
    result: vm.$refs.child.wrapper(),
    vm,

    unmount: () => app.unmount(),
  };
}
