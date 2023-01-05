import { h } from 'vue';
import vueQuery from '@/plugins/vueQuery';
import * as providerMap from '@/providers';
import { render, RenderOptions } from '@testing-library/vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import blocknative from '@/plugins/blocknative';

interface ProviderComponent {
  component: any;
  props: RenderOptions['props'];
}

// The order registration of the providers is important but Object.values behaves differently in the vite bundle.
// Setting explicit execution order in the following array:
const rootProviders: ProviderComponent[] = [
  { component: providerMap.UserSettingsProvider, props: {} },
  { component: providerMap.TokenListProvider, props: {} },
  { component: providerMap.TokensProvider, props: {} },
  { component: providerMap.AppProvider, props: {} },
];

export default function renderComponent(
  componentUnderTest,
  options: RenderOptions = {},
  providers: ProviderComponent[] = []
) {
  const { props, ...restOptions } = options;

  return render(
    renderWithRootProviders(componentUnderTest, props, [
      ...rootProviders,
      ...providers,
    ]),
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

function renderWithRootProviders(
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
