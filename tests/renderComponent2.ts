import { defineComponent, h } from 'vue';
import vueQuery from '@/plugins/vueQuery';
import { render, RenderOptions } from '@testing-library/vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import blocknative from '@/plugins/blocknative';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';
interface ProviderComponent {
  component: any;
  props: RenderOptions['props'];
}

const RootProvider = defineComponent({
  setup(props, { slots }) {
    const userSettings = provideUserSettings();
    const tokenLists = provideTokenLists();
    provideTokens(userSettings, tokenLists);
    return () => h('div', {}, slots.default && slots.default());
  },
});

const rootProviders: ProviderComponent[] = [
  { component: RootProvider, props: {} },
];

export default function renderComponent(
  componentUnderTest,
  options: RenderOptions = {},
  providers: ProviderComponent[] = []
) {
  const { props, ...restOptions } = options;
  const allProviders: ProviderComponent[] = [...rootProviders, ...providers];

  return render(
    renderComponentWithRootProviders(componentUnderTest, props, allProviders),
    {
      ...getOptions(restOptions),
    }
  );
}

function getOptions(
  options: Omit<RenderOptions, 'props'> = { global: {} }
): RenderOptions {
  return {
    ...options,
    global: {
      plugins: [vueQuery, Web3Plugin, blocknative],
      ...options.global,
    },
  };
}

function renderComponentWithRootProviders(
  componentUnderTest,
  props: RenderOptions['props'] = {},
  providers: ProviderComponent[]
) {
  function renderProviders(providers: ProviderComponent[]) {
    if (!providers.length) {
      return h(componentUnderTest, props);
    }

    const [provider, ...remainingProviders] = providers;

    return h(provider.component, provider.props, {
      default() {
        return renderProviders(remainingProviders);
      },
    });
  }

  return renderProviders(providers);
}
